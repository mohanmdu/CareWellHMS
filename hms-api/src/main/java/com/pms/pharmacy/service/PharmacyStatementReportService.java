package com.pms.pharmacy.service;

import com.pms.masters.entity.Consultant;
import com.pms.pharmacy.dto.DiReportEntryDto;
import com.pms.pharmacy.dto.ExpiredReportEntryDto;
import com.pms.pharmacy.dto.InventoryReportEntryDto;
import com.pms.pharmacy.dto.ItemWiseDetailEntryDto;
import com.pms.pharmacy.dto.ItemWiseSalesDetailDto;
import com.pms.pharmacy.dto.ItemWiseSalesSummaryDto;
import com.pms.pharmacy.dto.PatientBillEntryDto;
import com.pms.pharmacy.dto.PatientStatementDto;
import com.pms.pharmacy.dto.PatientStatementItemDto;
import com.pms.pharmacy.dto.PharmacyStatementEntryDto;
import com.pms.pharmacy.dto.ProductMovementEntryDto;
import com.pms.pharmacy.dto.PurchaseGstEntryDto;
import com.pms.pharmacy.dto.SalesGstEntryDto;
import com.pms.pharmacy.dto.SalesReturnGstEntryDto;
import com.pms.pharmacy.dto.SupplierOutstandingReportEntryDto;
import com.pms.pharmacy.dto.TaxStatementEntryDto;
import com.pms.common.EntityNotFoundException;
import com.pms.pharmacy.entity.DrugScheduleType;
import com.pms.pharmacy.entity.GrnStatus;
import com.pms.pharmacy.entity.MedicalCategory;
import com.pms.pharmacy.entity.PharmacyPaymentMode;
import com.pms.pharmacy.entity.PharmacySale;
import com.pms.pharmacy.entity.PharmacySaleItem;
import com.pms.pharmacy.repository.GrnItemRepository;
import com.pms.pharmacy.repository.GrnRepository;
import com.pms.pharmacy.repository.PharmacyReturnItemRepository;
import com.pms.pharmacy.repository.PharmacySaleItemRepository;
import com.pms.pharmacy.repository.PharmacySaleRepository;
import com.pms.pharmacy.repository.PharmacyStockRepository;
import com.pms.pharmacy.repository.ProductRepository;
import com.pms.pharmacy.repository.SupplierPaymentRecordRepository;
import com.pms.registration.entity.Patient;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Read-only aggregation/listing queries for the Pharmacy statement and GST
 * report tabs - deliberately separate from PharmacySaleService (which owns
 * bill creation/payment) to keep that service focused on the write path.
 */
@Service
@Transactional(readOnly = true)
public class PharmacyStatementReportService {

    private static final DateTimeFormatter DATE_KEY = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter MONTH_KEY = DateTimeFormatter.ofPattern("yyyy-MM");

    private final PharmacySaleRepository saleRepository;
    private final PharmacySaleItemRepository saleItemRepository;
    private final PharmacyReturnItemRepository returnItemRepository;
    private final GrnItemRepository grnItemRepository;
    private final PharmacyStockRepository stockRepository;
    private final GrnRepository grnRepository;
    private final SupplierPaymentRecordRepository supplierPaymentRepository;
    private final ProductRepository productRepository;

    public PharmacyStatementReportService(
            PharmacySaleRepository saleRepository,
            PharmacySaleItemRepository saleItemRepository,
            PharmacyReturnItemRepository returnItemRepository,
            GrnItemRepository grnItemRepository,
            PharmacyStockRepository stockRepository,
            GrnRepository grnRepository,
            SupplierPaymentRecordRepository supplierPaymentRepository,
            ProductRepository productRepository) {
        this.saleRepository = saleRepository;
        this.saleItemRepository = saleItemRepository;
        this.returnItemRepository = returnItemRepository;
        this.grnItemRepository = grnItemRepository;
        this.stockRepository = stockRepository;
        this.grnRepository = grnRepository;
        this.supplierPaymentRepository = supplierPaymentRepository;
        this.productRepository = productRepository;
    }

    public List<PharmacyStatementEntryDto> cashStatement(Instant fromInstant, Instant toInstant) {
        return saleRepository.search(fromInstant, toInstant, null, PharmacyPaymentMode.CASH, null, null).stream()
                .map(sale -> {
                    Patient patient = sale.getPatient();
                    return new PharmacyStatementEntryDto(
                            sale.getBillNumber(),
                            patient.getRegistrationNumber(),
                            sale.getSource().name(),
                            patientFullName(patient),
                            sale.getBilledAt(),
                            sale.getBilledBy(),
                            sale.getTotalAmount());
                })
                .toList();
    }

    public List<TaxStatementEntryDto> vatStatement(Instant fromInstant, Instant toInstant) {
        return groupTax(fromInstant, toInstant, DATE_KEY, ZoneId.systemDefault());
    }

    public List<TaxStatementEntryDto> gstStatement(Instant fromInstant, Instant toInstant) {
        return groupTax(fromInstant, toInstant, MONTH_KEY, ZoneId.systemDefault());
    }

    private List<TaxStatementEntryDto> groupTax(Instant fromInstant, Instant toInstant, DateTimeFormatter keyFormat, ZoneId zone) {
        Map<String, Double> byPeriod = new LinkedHashMap<>();
        for (PharmacySaleItem item : saleItemRepository.searchLines(fromInstant, toInstant)) {
            String key = item.getSale().getBilledAt().atZone(zone).toLocalDate().format(keyFormat);
            double tax = valueOrZero(item.getSgstAmount()) + valueOrZero(item.getCgstAmount());
            byPeriod.merge(key, tax, Double::sum);
        }
        return byPeriod.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new TaxStatementEntryDto(e.getKey(), e.getValue()))
                .toList();
    }

    public List<SalesGstEntryDto> salesGst(Instant fromInstant, Instant toInstant, Double gstPercent) {
        return saleItemRepository.searchLines(fromInstant, toInstant).stream()
                .filter(item -> matchesGstPercent(item.getSgstPercent(), item.getCgstPercent(), gstPercent))
                .map(item -> {
                    PharmacySale sale = item.getSale();
                    return new SalesGstEntryDto(
                            sale.getId(),
                            sale.getBillNumber(),
                            patientFullName(sale.getPatient()),
                            item.getProductName() + " (" + item.getQuantity() + ")",
                            item.getSgstPercent(),
                            item.getSgstAmount(),
                            item.getCgstPercent(),
                            item.getCgstAmount(),
                            item.getMrp(),
                            item.getNetAmount());
                })
                .toList();
    }

    public List<SalesReturnGstEntryDto> salesReturnGst(Instant fromInstant, Instant toInstant, Double gstPercent) {
        return returnItemRepository.searchApprovedLines(fromInstant, toInstant).stream()
                .filter(item -> matchesGstPercent(item.getSgstPercent(), item.getCgstPercent(), gstPercent))
                .map(item -> {
                    var pharmacyReturn = item.getPharmacyReturn();
                    var sale = pharmacyReturn.getSale();
                    return new SalesReturnGstEntryDto(
                            pharmacyReturn.getId(),
                            sale.getBillNumber(),
                            patientFullName(sale.getPatient()),
                            item.getProductName() + " (" + item.getQuantity() + ")",
                            item.getSgstPercent(),
                            item.getSgstAmount(),
                            item.getCgstPercent(),
                            item.getCgstAmount(),
                            item.getMrp(),
                            item.getNetAmount());
                })
                .toList();
    }

    public List<PurchaseGstEntryDto> purchaseGst(LocalDate fromDate, LocalDate toDate, Double gstPercent) {
        return grnItemRepository.searchApprovedLines(fromDate, toDate).stream()
                .filter(item -> matchesGstPercent(item.getSgstPercent(), item.getCgstPercent(), gstPercent))
                .map(item -> {
                    return new PurchaseGstEntryDto(
                            item.getGrn().getId(),
                            item.getGrn().getInvoiceNo(),
                            item.getProductName() + " (" + item.getTotalQty() + ")",
                            valueOrZero(item.getPurchaseRate()) * item.getTotalQty(),
                            item.getSgstPercent(),
                            item.getSgstAmount(),
                            item.getCgstPercent(),
                            item.getCgstAmount(),
                            item.getNetValue());
                })
                .toList();
    }

    public List<DiReportEntryDto> diReport(
            Instant fromInstant, Instant toInstant, DrugScheduleType scheduleType, Long patientId, String nameOrMobile) {
        return saleItemRepository.searchForDiReport(fromInstant, toInstant, scheduleType, patientId, nameOrMobile).stream()
                .map(item -> {
                    PharmacySale sale = item.getSale();
                    Consultant consultant = sale.getConsultant();
                    var product = item.getStock().getProduct();
                    return new DiReportEntryDto(
                            sale.getId(),
                            sale.getBillNumber(),
                            sale.getBilledAt(),
                            sale.getPatient().getRegistrationNumber(),
                            patientFullName(sale.getPatient()),
                            consultant != null ? consultant.getName() : null,
                            product.getManufacturer() != null ? product.getManufacturer().getName() : null,
                            item.getProductName(),
                            item.getQuantity(),
                            item.getMrp(),
                            item.getBatch(),
                            item.getExpiryDate(),
                            sale.getBilledBy());
                })
                .sorted(Comparator.comparing(DiReportEntryDto::date).reversed())
                .toList();
    }

    /** Every in-stock batch - Location Name filter is omitted (PharmacyStock has no location dimension; location is a tag on transactions, not stock). */
    public List<InventoryReportEntryDto> inventoryReport() {
        return stockRepository.findByQuantityOnHandGreaterThanOrderByProductNameAsc(0).stream()
                .map(stock -> {
                    int packing = stock.getPacking() != null && stock.getPacking() > 0 ? stock.getPacking() : 1;
                    int noPack = stock.getQuantityOnHand() / packing;
                    double sellingPrice = valueOrZero(stock.getMrp());
                    double purchasePrice = valueOrZero(stock.getPurchaseRate());
                    return new InventoryReportEntryDto(
                            stock.getProduct().getId(),
                            stock.getProductName(),
                            stock.getBatch(),
                            packing,
                            noPack,
                            stock.getQuantityOnHand(),
                            sellingPrice,
                            stock.getQuantityOnHand() * sellingPrice,
                            purchasePrice,
                            stock.getQuantityOnHand() * purchasePrice,
                            stock.getExpiryDate());
                })
                .toList();
    }

    /** Expired/near-expiry batches - defaults to "already expired or expiring within 3 months" when no explicit range is given. */
    public List<ExpiredReportEntryDto> expiredReport(LocalDate fromDate, LocalDate toDate) {
        LocalDate effectiveTo = toDate != null ? toDate : LocalDate.now().plusMonths(3);
        return stockRepository.searchExpiring(fromDate, effectiveTo).stream()
                .map(stock -> {
                    var grn = stock.getGrnItem().getGrn();
                    var manufacturer = stock.getProduct().getManufacturer();
                    double mrp = valueOrZero(stock.getMrp());
                    double purchasePrice = valueOrZero(stock.getPurchaseRate());
                    return new ExpiredReportEntryDto(
                            stock.getProductName(),
                            manufacturer != null ? manufacturer.getName() : null,
                            grn.getSupplier().getName(),
                            stock.getBatch(),
                            stock.getQuantityOnHand(),
                            purchasePrice,
                            mrp,
                            stock.getQuantityOnHand() * mrp,
                            stock.getQuantityOnHand() * purchasePrice,
                            stock.getExpiryDate());
                })
                .toList();
    }

    /** Approved GRNs in range with their live-computed paid/balance (see SupplierPaymentService's class doc for why balance isn't stored). */
    public List<SupplierOutstandingReportEntryDto> supplierOutstandingReport(LocalDate fromDate, LocalDate toDate) {
        return grnRepository.findByStatusOrderByGrnDateAsc(GrnStatus.APPROVED).stream()
                .filter(grn -> (fromDate == null || !grn.getGrnDate().isBefore(fromDate)) && (toDate == null || !grn.getGrnDate().isAfter(toDate)))
                .map(grn -> {
                    double paid = supplierPaymentRepository.sumByGrnId(grn.getId());
                    return new SupplierOutstandingReportEntryDto(
                            grn.getId(), grn.getSupplier().getName(), grn.getGrnDate(), grn.getInvoiceNo(), grn.getInvoiceAmount(), paid,
                            grn.getInvoiceAmount() - paid);
                })
                .toList();
    }

    /** Level 1 (grouped by product+batch) with Level 2 (individual sale rows) already embedded - no extra query on expand. */
    public List<ItemWiseSalesSummaryDto> itemWiseSalesSummary(Instant fromInstant, Instant toInstant, String drugName) {
        Map<String, List<PharmacySaleItem>> byProductBatch = new LinkedHashMap<>();
        for (PharmacySaleItem item : saleItemRepository.searchLines(fromInstant, toInstant)) {
            if (drugName != null && !item.getProductName().toLowerCase().contains(drugName.toLowerCase())) {
                continue;
            }
            byProductBatch.computeIfAbsent(item.getProductName() + "|" + item.getBatch(), k -> new ArrayList<>()).add(item);
        }
        List<ItemWiseSalesSummaryDto> result = new ArrayList<>();
        for (List<PharmacySaleItem> items : byProductBatch.values()) {
            PharmacySaleItem first = items.get(0);
            int saleQty = items.stream().mapToInt(PharmacySaleItem::getQuantity).sum();
            double netAmount = items.stream().mapToDouble(PharmacySaleItem::getNetAmount).sum();
            List<ItemWiseSalesDetailDto> details = items.stream()
                    .map(i -> new ItemWiseSalesDetailDto(
                            i.getSale().getId(),
                            i.getSale().getBillNumber(),
                            i.getBatch(),
                            valueOrZero(i.getSgstPercent()) + valueOrZero(i.getCgstPercent()),
                            i.getSale().getPatient().getRegistrationNumber(),
                            patientFullName(i.getSale().getPatient()),
                            i.getQuantity(),
                            i.getSale().getBilledAt()))
                    .toList();
            result.add(new ItemWiseSalesSummaryDto(first.getProductName(), first.getBatch(), first.getMrp(), saleQty, netAmount, details));
        }
        return result;
    }

    /** GRN-line breakdown; Report Type (Supplier/Company/Product Wise) is a frontend-only toggle of which filter is shown - filters just AND together here. */
    public List<ItemWiseDetailEntryDto> itemWiseDetails(LocalDate fromDate, LocalDate toDate, Long supplierId, Long manufacturerId, String drugName) {
        return grnItemRepository.searchApprovedLines(fromDate, toDate).stream()
                .filter(item -> supplierId == null || item.getGrn().getSupplier().getId().equals(supplierId))
                .filter(item -> manufacturerId == null
                        || (item.getProduct().getManufacturer() != null && item.getProduct().getManufacturer().getId().equals(manufacturerId)))
                .filter(item -> drugName == null || item.getProductName().toLowerCase().contains(drugName.toLowerCase()))
                .map(item -> {
                    var manufacturer = item.getProduct().getManufacturer();
                    return new ItemWiseDetailEntryDto(
                            item.getGrn().getId(),
                            item.getGrn().getInvoiceNo(),
                            item.getProductName(),
                            item.getProductTypeName(),
                            item.getBatch(),
                            item.getTotalQty(),
                            item.getPurchaseRate(),
                            item.getMrp(),
                            item.getNetValue(),
                            item.getGrn().getSupplier().getName(),
                            manufacturer != null ? manufacturer.getName() : null);
                })
                .toList();
    }

    /** Patient Wise Report's "Bill Wise" tab - registrationNumber doubles as the UHID/IPID lookup key (see plan doc). */
    public List<PatientBillEntryDto> patientBills(String registrationNumber, String nameOrMobile, Instant fromInstant, Instant toInstant) {
        return saleRepository.searchByPatient(registrationNumber, nameOrMobile, fromInstant, toInstant).stream()
                .map(sale -> new PatientBillEntryDto(
                        sale.getId(),
                        sale.getBillNumber(),
                        sale.getPatient().getRegistrationNumber(),
                        patientFullName(sale.getPatient()),
                        sale.getSource().name(),
                        sale.getBilledAt(),
                        sale.getTotalAmount(),
                        sale.getBalanceAmount() <= 0 ? sale.getBilledAt() : null,
                        sale.getBalanceAmount()))
                .toList();
    }

    /** Patient Wise Report's "Details Report" tab - one bill's items split Medical/Non-Medical per Product.medOrNonMed. */
    public PatientStatementDto patientStatement(Long saleId) {
        PharmacySale sale = saleRepository.findById(saleId).orElseThrow(() -> new EntityNotFoundException("Pharmacy Sale not found: " + saleId));
        List<PatientStatementItemDto> medical = new ArrayList<>();
        List<PatientStatementItemDto> nonMedical = new ArrayList<>();
        for (PharmacySaleItem item : sale.getItems()) {
            PatientStatementItemDto dto = new PatientStatementItemDto(
                    item.getProductTypeName(), item.getProductName(), item.getBatch(), item.getExpiryDate(), item.getQuantity(), item.getMrp(),
                    item.getNetAmount());
            if (item.getStock().getProduct().getMedOrNonMed() == MedicalCategory.MEDICAL) {
                medical.add(dto);
            } else {
                nonMedical.add(dto);
            }
        }
        Patient patient = sale.getPatient();
        return new PatientStatementDto(
                patient.getRegistrationNumber(), patientFullName(patient), patient.getGender(), medical, nonMedical, sale.getAmountPaid(),
                valueOrZero(sale.getDiscountAmount()), sale.getBalanceAmount());
    }

    /** Shared per-product movement dataset behind Pharmacy MIS's Fast/Slow/Non-Moving tabs (each just sorts/filters this differently client-side). */
    public List<ProductMovementEntryDto> productMovement(LocalDate fromDate, LocalDate toDate) {
        Instant fromInstant = fromDate != null ? fromDate.atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        Instant toInstant = toDate != null ? toDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        List<ProductMovementEntryDto> result = new ArrayList<>();
        for (var product : productRepository.findByActiveTrueOrderByNameAsc()) {
            int purchaseQty = grnItemRepository.sumReceivedQtyByProductIdInRange(product.getId(), fromDate, toDate);
            int salesQty = saleItemRepository.sumQuantityByProductIdInRange(product.getId(), fromInstant, toInstant);
            int returnQty = returnItemRepository.sumApprovedQuantityByProductIdInRange(product.getId(), fromInstant, toInstant);
            if (purchaseQty == 0 && salesQty == 0) {
                continue;
            }
            result.add(new ProductMovementEntryDto(product.getId(), product.getName(), purchaseQty, salesQty, returnQty, salesQty - returnQty));
        }
        return result;
    }

    private static boolean matchesGstPercent(Double sgstPercent, Double cgstPercent, Double gstPercent) {
        if (gstPercent == null) {
            return true;
        }
        double total = valueOrZero(sgstPercent) + valueOrZero(cgstPercent);
        return Math.abs(total - gstPercent) < 0.001;
    }

    private static double valueOrZero(Double value) {
        return value != null ? value : 0.0;
    }

    private static String patientFullName(Patient patient) {
        return (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim();
    }
}
