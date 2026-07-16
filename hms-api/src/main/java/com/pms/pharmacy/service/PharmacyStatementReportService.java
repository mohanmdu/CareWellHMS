package com.pms.pharmacy.service;

import com.pms.masters.entity.Consultant;
import com.pms.pharmacy.dto.DiReportEntryDto;
import com.pms.pharmacy.dto.PharmacyStatementEntryDto;
import com.pms.pharmacy.dto.PurchaseGstEntryDto;
import com.pms.pharmacy.dto.SalesGstEntryDto;
import com.pms.pharmacy.dto.SalesReturnGstEntryDto;
import com.pms.pharmacy.dto.TaxStatementEntryDto;
import com.pms.pharmacy.entity.DrugScheduleType;
import com.pms.pharmacy.entity.PharmacyPaymentMode;
import com.pms.pharmacy.entity.PharmacySale;
import com.pms.pharmacy.entity.PharmacySaleItem;
import com.pms.pharmacy.repository.GrnItemRepository;
import com.pms.pharmacy.repository.PharmacyReturnItemRepository;
import com.pms.pharmacy.repository.PharmacySaleItemRepository;
import com.pms.pharmacy.repository.PharmacySaleRepository;
import com.pms.registration.entity.Patient;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
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

    public PharmacyStatementReportService(
            PharmacySaleRepository saleRepository,
            PharmacySaleItemRepository saleItemRepository,
            PharmacyReturnItemRepository returnItemRepository,
            GrnItemRepository grnItemRepository) {
        this.saleRepository = saleRepository;
        this.saleItemRepository = saleItemRepository;
        this.returnItemRepository = returnItemRepository;
        this.grnItemRepository = grnItemRepository;
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
