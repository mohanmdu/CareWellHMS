package com.pms.pharmacy.controller;

import com.pms.pharmacy.dto.PharmacyReturnDto;
import com.pms.pharmacy.dto.PharmacyReturnInvoiceDto;
import com.pms.pharmacy.dto.PharmacyReturnListEntryDto;
import com.pms.pharmacy.dto.PharmacyReturnRequest;
import com.pms.pharmacy.dto.PharmacyReturnSummaryDto;
import com.pms.pharmacy.service.PharmacyReturnService;
import jakarta.validation.Valid;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pharmacy/returns")
public class PharmacyReturnController {

    private final PharmacyReturnService service;

    public PharmacyReturnController(PharmacyReturnService service) {
        this.service = service;
    }

    // Unchanged path/verb/DTO shape - the only consumer is the legacy
    // read-only Return tab in detailed-sales-report.component.ts.
    @GetMapping
    public List<PharmacyReturnListEntryDto> search(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return service.search(toFromInstant(fromDate), toToInstant(toDate));
    }

    @GetMapping("/invoice/{billNumber}")
    public PharmacyReturnInvoiceDto findInvoice(@PathVariable Long billNumber) {
        return service.findInvoiceForReturn(billNumber);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PharmacyReturnDto create(@Valid @RequestBody PharmacyReturnRequest request) {
        return service.create(request);
    }

    @GetMapping("/pending")
    public List<PharmacyReturnSummaryDto> pending(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return service.findPending(toFromInstant(fromDate), toToInstant(toDate));
    }

    @GetMapping("/report")
    public List<PharmacyReturnSummaryDto> report(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long locationId) {
        return service.findReport(toFromInstant(fromDate), toToInstant(toDate), locationId);
    }

    @GetMapping("/{id}")
    public PharmacyReturnDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PatchMapping("/{id}/approve")
    public PharmacyReturnDto approve(@PathVariable Long id) {
        return service.approve(id);
    }

    private static Instant toFromInstant(LocalDate fromDate) {
        return fromDate != null ? fromDate.atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
    }

    private static Instant toToInstant(LocalDate toDate) {
        return toDate != null ? toDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
    }
}
