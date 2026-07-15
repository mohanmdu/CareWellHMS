package com.pms.pharmacy.service;

import com.pms.common.EntityNotFoundException;
import com.pms.masters.entity.Consultant;
import com.pms.pharmacy.dto.PharmacyReturnDto;
import com.pms.pharmacy.dto.PharmacyReturnInvoiceDto;
import com.pms.pharmacy.dto.PharmacyReturnInvoiceItemDto;
import com.pms.pharmacy.dto.PharmacyReturnItemDto;
import com.pms.pharmacy.dto.PharmacyReturnItemRequest;
import com.pms.pharmacy.dto.PharmacyReturnListEntryDto;
import com.pms.pharmacy.dto.PharmacyReturnRequest;
import com.pms.pharmacy.dto.PharmacyReturnSummaryDto;
import com.pms.pharmacy.entity.PharmacyReturn;
import com.pms.pharmacy.entity.PharmacyReturnItem;
import com.pms.pharmacy.entity.PharmacyReturnStatus;
import com.pms.pharmacy.entity.PharmacySale;
import com.pms.pharmacy.entity.PharmacySaleItem;
import com.pms.pharmacy.repository.PharmacyReturnItemRepository;
import com.pms.pharmacy.repository.PharmacyReturnRepository;
import com.pms.pharmacy.repository.PharmacySaleItemRepository;
import com.pms.pharmacy.repository.PharmacySaleRepository;
import com.pms.registration.entity.Patient;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Two-step Sales Return workflow: create() persists a PENDING header + lines
 * against an invoice without touching stock; approve() is the only place
 * PharmacyStockService.credit() is called, flipping status to APPROVED. The
 * legacy search(fromInstant, toInstant) method/signature is kept unchanged -
 * it's the only endpoint detailed-sales-report.component.ts's read-only
 * Return tab calls - now backed by PharmacyReturnItemRepository's
 * APPROVED-only line query instead of the old flat table.
 */
@Service
@Transactional(readOnly = true)
public class PharmacyReturnService {

    private final PharmacyReturnRepository repository;
    private final PharmacyReturnItemRepository itemRepository;
    private final PharmacySaleRepository saleRepository;
    private final PharmacySaleItemRepository saleItemRepository;
    private final PharmacyStockService stockService;

    public PharmacyReturnService(
            PharmacyReturnRepository repository,
            PharmacyReturnItemRepository itemRepository,
            PharmacySaleRepository saleRepository,
            PharmacySaleItemRepository saleItemRepository,
            PharmacyStockService stockService) {
        this.repository = repository;
        this.itemRepository = itemRepository;
        this.saleRepository = saleRepository;
        this.saleItemRepository = saleItemRepository;
        this.stockService = stockService;
    }

    public PharmacyReturnInvoiceDto findInvoiceForReturn(Long billNumber) {
        PharmacySale sale = saleRepository.findByBillNumber(billNumber)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + billNumber));
        Patient patient = sale.getPatient();
        Consultant consultant = sale.getConsultant();

        List<PharmacyReturnInvoiceItemDto> items = sale.getItems().stream()
                .map(item -> {
                    int remaining = item.getQuantity() - itemRepository.sumQuantityBySaleItemId(item.getId());
                    var manufacturer = item.getStock().getProduct().getManufacturer();
                    return new PharmacyReturnInvoiceItemDto(
                            item.getId(),
                            item.getProductName(),
                            item.getProductTypeName(),
                            item.getBatch(),
                            item.getExpiryDate(),
                            manufacturer != null ? manufacturer.getName() : null,
                            item.getQuantity(),
                            remaining,
                            item.getMrp(),
                            item.getSgstPercent(),
                            item.getCgstPercent(),
                            item.getNetAmount());
                })
                .toList();

        return new PharmacyReturnInvoiceDto(
                sale.getId(),
                sale.getBillNumber(),
                sale.getBilledAt(),
                patient.getId(),
                patient.getRegistrationNumber(),
                patientName(patient),
                consultant != null ? consultant.getName() : null,
                sale.getLocation().getId(),
                sale.getLocation().getName(),
                items);
    }

    @Transactional
    public PharmacyReturnDto create(PharmacyReturnRequest request) {
        PharmacySale sale = saleRepository.findById(request.saleId())
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + request.saleId()));

        List<PharmacyReturnItem> items = new ArrayList<>();
        double total = 0;
        for (PharmacyReturnItemRequest itemRequest : request.items()) {
            PharmacySaleItem saleItem = saleItemRepository.findById(itemRequest.saleItemId())
                    .orElseThrow(() -> new EntityNotFoundException("Sale item not found: " + itemRequest.saleItemId()));
            if (!saleItem.getSale().getId().equals(sale.getId())) {
                throw new IllegalArgumentException(
                        "Sale item " + itemRequest.saleItemId() + " does not belong to invoice " + sale.getBillNumber());
            }

            int remaining = saleItem.getQuantity() - itemRepository.sumQuantityBySaleItemId(saleItem.getId());
            if (itemRequest.quantity() > remaining) {
                throw new IllegalArgumentException(
                        "Cannot return " + itemRequest.quantity() + " - only " + remaining + " of this line remain unreturned.");
            }

            double proportion = (double) itemRequest.quantity() / saleItem.getQuantity();
            double amount = saleItem.getAmount() * proportion;
            double sgstAmount = saleItem.getSgstAmount() * proportion;
            double cgstAmount = saleItem.getCgstAmount() * proportion;
            double netAmount = saleItem.getNetAmount() * proportion;

            PharmacyReturnItem item = new PharmacyReturnItem();
            item.setSaleItem(saleItem);
            item.setProductName(saleItem.getProductName());
            item.setBatch(saleItem.getBatch());
            item.setMrp(saleItem.getMrp());
            item.setQuantity(itemRequest.quantity());
            item.setAmount(amount);
            item.setSgstPercent(saleItem.getSgstPercent());
            item.setSgstAmount(sgstAmount);
            item.setCgstPercent(saleItem.getCgstPercent());
            item.setCgstAmount(cgstAmount);
            item.setNetAmount(netAmount);
            items.add(item);
            total += netAmount;
        }

        PharmacyReturn pharmacyReturn = new PharmacyReturn();
        pharmacyReturn.setSale(sale);
        pharmacyReturn.setReturnType(request.returnType());
        pharmacyReturn.setStatus(PharmacyReturnStatus.PENDING);
        pharmacyReturn.setTotalAmount(total);
        pharmacyReturn.setRemarks(request.remarks());
        pharmacyReturn.setSubmittedBy(currentUsername());
        pharmacyReturn.setSubmittedAt(Instant.now());
        items.forEach(item -> item.setPharmacyReturn(pharmacyReturn));
        pharmacyReturn.setItems(items);

        return toDto(repository.save(pharmacyReturn));
    }

    @Transactional
    public PharmacyReturnDto approve(Long id) {
        PharmacyReturn pharmacyReturn = getOrThrow(id);
        if (pharmacyReturn.getStatus() == PharmacyReturnStatus.APPROVED) {
            throw new IllegalArgumentException("Return #" + id + " is already approved.");
        }

        for (PharmacyReturnItem item : pharmacyReturn.getItems()) {
            stockService.credit(item.getSaleItem().getStock().getId(), item.getQuantity());
        }

        pharmacyReturn.setStatus(PharmacyReturnStatus.APPROVED);
        pharmacyReturn.setApprovedBy(currentUsername());
        pharmacyReturn.setApprovedAt(Instant.now());

        return toDto(repository.save(pharmacyReturn));
    }

    public PharmacyReturnDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    public List<PharmacyReturnSummaryDto> findPending(Instant fromInstant, Instant toInstant) {
        return repository.search(PharmacyReturnStatus.PENDING, fromInstant, toInstant, null).stream()
                .map(this::toSummaryDto)
                .toList();
    }

    public List<PharmacyReturnSummaryDto> findReport(Instant fromInstant, Instant toInstant, Long locationId) {
        return repository.search(PharmacyReturnStatus.APPROVED, fromInstant, toInstant, locationId).stream()
                .map(this::toSummaryDto)
                .toList();
    }

    public List<PharmacyReturnListEntryDto> search(Instant fromInstant, Instant toInstant) {
        return itemRepository.searchApprovedLines(fromInstant, toInstant).stream().map(this::toListEntry).toList();
    }

    private PharmacyReturn getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Pharmacy Return not found: " + id));
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private static String patientName(Patient patient) {
        return (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim();
    }

    private PharmacyReturnListEntryDto toListEntry(PharmacyReturnItem item) {
        PharmacyReturn pharmacyReturn = item.getPharmacyReturn();
        PharmacySale sale = item.getSaleItem().getSale();
        return new PharmacyReturnListEntryDto(
                item.getId(),
                sale.getId(),
                sale.getBillNumber(),
                item.getProductName(),
                item.getQuantity(),
                item.getNetAmount(),
                pharmacyReturn.getRemarks(),
                pharmacyReturn.getApprovedBy(),
                pharmacyReturn.getApprovedAt());
    }

    private PharmacyReturnSummaryDto toSummaryDto(PharmacyReturn pharmacyReturn) {
        PharmacySale sale = pharmacyReturn.getSale();
        Patient patient = sale.getPatient();
        return new PharmacyReturnSummaryDto(
                pharmacyReturn.getId(),
                sale.getId(),
                sale.getBillNumber(),
                patient.getId(),
                patient.getRegistrationNumber(),
                patientName(patient),
                sale.getLocation().getId(),
                sale.getLocation().getName(),
                pharmacyReturn.getReturnType(),
                pharmacyReturn.getStatus(),
                pharmacyReturn.getTotalAmount(),
                pharmacyReturn.getRemarks(),
                pharmacyReturn.getSubmittedBy(),
                pharmacyReturn.getSubmittedAt(),
                pharmacyReturn.getApprovedBy(),
                pharmacyReturn.getApprovedAt());
    }

    private PharmacyReturnDto toDto(PharmacyReturn pharmacyReturn) {
        PharmacySale sale = pharmacyReturn.getSale();
        Patient patient = sale.getPatient();
        List<PharmacyReturnItemDto> items = pharmacyReturn.getItems().stream()
                .map(item -> new PharmacyReturnItemDto(
                        item.getId(),
                        item.getSaleItem().getId(),
                        item.getProductName(),
                        item.getBatch(),
                        item.getMrp(),
                        item.getQuantity(),
                        item.getAmount(),
                        item.getSgstPercent(),
                        item.getSgstAmount(),
                        item.getCgstPercent(),
                        item.getCgstAmount(),
                        item.getNetAmount()))
                .toList();
        return new PharmacyReturnDto(
                pharmacyReturn.getId(),
                sale.getId(),
                sale.getBillNumber(),
                patient.getId(),
                patient.getRegistrationNumber(),
                patientName(patient),
                sale.getLocation().getId(),
                sale.getLocation().getName(),
                pharmacyReturn.getReturnType(),
                pharmacyReturn.getStatus(),
                items,
                pharmacyReturn.getTotalAmount(),
                pharmacyReturn.getRemarks(),
                pharmacyReturn.getSubmittedBy(),
                pharmacyReturn.getSubmittedAt(),
                pharmacyReturn.getApprovedBy(),
                pharmacyReturn.getApprovedAt());
    }
}
