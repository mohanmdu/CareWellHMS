package com.pms.pharmacy.service;

import com.pms.common.EntityNotFoundException;
import com.pms.masters.entity.Consultant;
import com.pms.masters.repository.ConsultantRepository;
import com.pms.pharmacy.dto.PharmacySaleDto;
import com.pms.pharmacy.dto.PharmacySaleItemDto;
import com.pms.pharmacy.dto.PharmacySaleItemRequest;
import com.pms.pharmacy.dto.PharmacySaleListEntryDto;
import com.pms.pharmacy.dto.PharmacySalePaymentRequest;
import com.pms.pharmacy.dto.PharmacySaleRequest;
import com.pms.pharmacy.entity.PharmacyLocation;
import com.pms.pharmacy.entity.PharmacyPaymentMode;
import com.pms.pharmacy.entity.PharmacySale;
import com.pms.pharmacy.entity.PharmacySaleItem;
import com.pms.pharmacy.entity.PharmacySaleSource;
import com.pms.pharmacy.entity.PharmacyStock;
import com.pms.pharmacy.entity.Product;
import com.pms.pharmacy.repository.PharmacyLocationRepository;
import com.pms.pharmacy.repository.PharmacySaleRepository;
import com.pms.pharmacy.repository.PharmacyStockRepository;
import com.pms.registration.entity.Patient;
import com.pms.registration.repository.PatientRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PharmacySaleService {

    private final PharmacySaleRepository repository;
    private final PatientRepository patientRepository;
    private final PharmacyLocationRepository locationRepository;
    private final ConsultantRepository consultantRepository;
    private final PharmacyStockRepository stockRepository;
    private final PharmacyStockService stockService;
    private final PharmacyRequestService requestService;
    private final PharmacyBillNumberService billNumberService;

    public PharmacySaleService(
            PharmacySaleRepository repository,
            PatientRepository patientRepository,
            PharmacyLocationRepository locationRepository,
            ConsultantRepository consultantRepository,
            PharmacyStockRepository stockRepository,
            PharmacyStockService stockService,
            PharmacyRequestService requestService,
            PharmacyBillNumberService billNumberService) {
        this.repository = repository;
        this.patientRepository = patientRepository;
        this.locationRepository = locationRepository;
        this.consultantRepository = consultantRepository;
        this.stockRepository = stockRepository;
        this.stockService = stockService;
        this.requestService = requestService;
        this.billNumberService = billNumberService;
    }

    public PharmacySaleDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    public List<PharmacySaleListEntryDto> search(
            Instant fromInstant, Instant toInstant, PharmacySaleSource source, PharmacyPaymentMode paymentMode, Long locationId, String billedBy) {
        return repository.search(fromInstant, toInstant, source, paymentMode, locationId, billedBy).stream()
                .map(this::toListEntry)
                .toList();
    }

    public List<PharmacySaleListEntryDto> findDue(PharmacySaleSource source, Long locationId, String pid, String nameOrMobile) {
        return repository.findDue(source, locationId, pid, nameOrMobile).stream().map(this::toListEntry).toList();
    }

    @Transactional
    public PharmacySaleDto pay(Long saleId, PharmacySalePaymentRequest request) {
        PharmacySale sale = getOrThrow(saleId);
        double amount = valueOrZero(request.amount());
        double discountAmount = valueOrZero(request.discountAmount());
        if (amount + discountAmount > sale.getBalanceAmount()) {
            throw new IllegalArgumentException("Amount and discount/return cannot exceed the outstanding balance");
        }
        sale.setAmountPaid(sale.getAmountPaid() + amount);
        sale.setDiscountAmount(valueOrZero(sale.getDiscountAmount()) + discountAmount);
        sale.setBalanceAmount(sale.getTotalAmount() - sale.getDiscountAmount() - sale.getAmountPaid());
        String note = "Payment: " + amount + " via " + request.payMode()
                + (request.remarks() != null && !request.remarks().isBlank() ? " (" + request.remarks() + ")" : "");
        sale.setRemarks(sale.getRemarks() != null && !sale.getRemarks().isBlank() ? sale.getRemarks() + " | " + note : note);
        return toDto(repository.save(sale));
    }

    @Transactional
    public PharmacySaleDto create(PharmacySaleRequest request) {
        Patient patient = patientRepository.findById(request.patientId())
                .orElseThrow(() -> new EntityNotFoundException("Patient not found: " + request.patientId()));
        PharmacyLocation location = locationRepository.findById(request.locationId())
                .orElseThrow(() -> new EntityNotFoundException("Pharmacy Location not found: " + request.locationId()));
        Consultant consultant = null;
        if (request.consultantId() != null) {
            consultant = consultantRepository.findById(request.consultantId())
                    .orElseThrow(() -> new EntityNotFoundException("Consultant not found: " + request.consultantId()));
        }

        PharmacySale sale = new PharmacySale();
        sale.setBillNumber(billNumberService.next());
        sale.setPatient(patient);
        sale.setLocation(location);
        sale.setSource(request.source());
        sale.setBillingType(request.billingType());
        sale.setPaymentMode(request.paymentMode());
        sale.setConsultant(consultant);
        sale.setDiscountPercent(request.discountPercent());
        sale.setDiscountAmount(request.discountAmount());
        sale.setDiscountReason(request.discountReason());
        sale.setRemarks(request.remarks());
        sale.setBilledBy(currentUsername());
        sale.setBilledAt(Instant.now());

        List<PharmacySaleItem> items = new ArrayList<>();
        double total = 0;
        for (PharmacySaleItemRequest itemRequest : request.items()) {
            PharmacyStock stock = stockRepository.findById(itemRequest.stockId())
                    .orElseThrow(() -> new EntityNotFoundException("Stock not found: " + itemRequest.stockId()));
            Product product = stock.getProduct();

            double sgstPercent = valueOrZero(product.getStateGst());
            double cgstPercent = valueOrZero(product.getCentralGst());
            double amount = valueOrZero(stock.getMrp()) * itemRequest.quantity();
            double sgstAmount = amount * sgstPercent / 100;
            double cgstAmount = amount * cgstPercent / 100;
            double netAmount = amount + sgstAmount + cgstAmount;

            PharmacySaleItem item = new PharmacySaleItem();
            item.setSale(sale);
            item.setStock(stock);
            item.setProductName(stock.getProductName());
            item.setProductTypeName(stock.getProductTypeName());
            item.setBatch(stock.getBatch());
            item.setExpiryDate(stock.getExpiryDate());
            item.setMrp(stock.getMrp());
            item.setQuantity(itemRequest.quantity());
            item.setAmount(amount);
            item.setHsnSac(product.getHsnSac());
            item.setSgstPercent(sgstPercent);
            item.setSgstAmount(sgstAmount);
            item.setCgstPercent(cgstPercent);
            item.setCgstAmount(cgstAmount);
            item.setNetAmount(netAmount);
            items.add(item);
            total += netAmount;

            stockService.decrement(stock.getId(), itemRequest.quantity());
        }
        sale.setItems(items);

        double discountAmount = valueOrZero(request.discountAmount());
        sale.setTotalAmount(total);
        sale.setAmountPaid(request.amountPaid());
        sale.setBalanceAmount(total - discountAmount - request.amountPaid());

        PharmacySale saved = repository.save(sale);

        if (request.pharmacyRequestId() != null) {
            requestService.markBilled(request.pharmacyRequestId());
        }

        return toDto(saved);
    }

    private static double valueOrZero(Double value) {
        return value != null ? value : 0.0;
    }

    private PharmacySale getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Pharmacy Sale not found: " + id));
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private PharmacySaleListEntryDto toListEntry(PharmacySale sale) {
        Patient patient = sale.getPatient();
        return new PharmacySaleListEntryDto(
                sale.getId(),
                sale.getBillNumber(),
                patient.getRegistrationNumber(),
                (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim(),
                sale.getSource(),
                sale.getBillingType(),
                sale.getPaymentMode(),
                sale.getBilledAt(),
                sale.getBilledBy(),
                sale.getTotalAmount(),
                sale.getDiscountAmount(),
                sale.getAmountPaid(),
                sale.getBalanceAmount());
    }

    private PharmacySaleDto toDto(PharmacySale sale) {
        Patient patient = sale.getPatient();
        Consultant consultant = sale.getConsultant();
        List<PharmacySaleItemDto> items = sale.getItems().stream()
                .map(item -> new PharmacySaleItemDto(
                        item.getId(),
                        item.getStock().getId(),
                        item.getProductName(),
                        item.getProductTypeName(),
                        item.getBatch(),
                        item.getExpiryDate(),
                        item.getMrp(),
                        item.getQuantity(),
                        item.getAmount(),
                        item.getHsnSac(),
                        item.getSgstPercent(),
                        item.getSgstAmount(),
                        item.getCgstPercent(),
                        item.getCgstAmount(),
                        item.getNetAmount()))
                .toList();
        return new PharmacySaleDto(
                sale.getId(),
                sale.getBillNumber(),
                patient.getId(),
                patient.getRegistrationNumber(),
                (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim(),
                patient.getGender(),
                patient.getAge(),
                patient.getMobileNumber(),
                patient.getAddress(),
                sale.getLocation().getId(),
                sale.getLocation().getName(),
                sale.getSource(),
                sale.getBillingType(),
                sale.getPaymentMode(),
                consultant != null ? consultant.getId() : null,
                consultant != null ? consultant.getName() : null,
                sale.getDiscountPercent(),
                sale.getDiscountAmount(),
                sale.getDiscountReason(),
                items,
                sale.getTotalAmount(),
                sale.getAmountPaid(),
                sale.getBalanceAmount(),
                sale.getRemarks(),
                sale.getBilledBy(),
                sale.getBilledAt());
    }
}
