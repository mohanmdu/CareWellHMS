package com.pms.pharmacy.controller;

import com.pms.pharmacy.dto.DiReportEntryDto;
import com.pms.pharmacy.dto.PharmacyStatementEntryDto;
import com.pms.pharmacy.dto.PurchaseGstEntryDto;
import com.pms.pharmacy.dto.SalesGstEntryDto;
import com.pms.pharmacy.dto.SalesReturnGstEntryDto;
import com.pms.pharmacy.dto.TaxStatementEntryDto;
import com.pms.pharmacy.entity.DrugScheduleType;
import com.pms.pharmacy.service.PharmacyStatementReportService;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pharmacy/reports")
public class PharmacyStatementReportController {

    private final PharmacyStatementReportService service;

    public PharmacyStatementReportController(PharmacyStatementReportService service) {
        this.service = service;
    }

    @GetMapping("/cash-statement")
    public List<PharmacyStatementEntryDto> cashStatement(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return service.cashStatement(toInstant(fromDate), toInstantExclusive(toDate));
    }

    @GetMapping("/vat-statement")
    public List<TaxStatementEntryDto> vatStatement(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return service.vatStatement(toInstant(fromDate), toInstantExclusive(toDate));
    }

    @GetMapping("/gst-statement")
    public List<TaxStatementEntryDto> gstStatement(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return service.gstStatement(toInstant(fromDate), toInstantExclusive(toDate));
    }

    @GetMapping("/sales-gst")
    public List<SalesGstEntryDto> salesGst(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Double gstPercent) {
        return service.salesGst(toInstant(fromDate), toInstantExclusive(toDate), gstPercent);
    }

    @GetMapping("/sales-return-gst")
    public List<SalesReturnGstEntryDto> salesReturnGst(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Double gstPercent) {
        return service.salesReturnGst(toInstant(fromDate), toInstantExclusive(toDate), gstPercent);
    }

    @GetMapping("/purchase-gst")
    public List<PurchaseGstEntryDto> purchaseGst(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Double gstPercent) {
        return service.purchaseGst(fromDate, toDate, gstPercent);
    }

    @GetMapping("/di")
    public List<DiReportEntryDto> diReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) DrugScheduleType type,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) String nameOrMobile) {
        return service.diReport(toInstant(fromDate), toInstantExclusive(toDate), type, patientId, nameOrMobile);
    }

    private static Instant toInstant(LocalDate date) {
        return date != null ? date.atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
    }

    private static Instant toInstantExclusive(LocalDate date) {
        return date != null ? date.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
    }
}
