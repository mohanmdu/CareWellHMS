package com.pms.pharmacy.controller;

import com.pms.pharmacy.dto.PharmacyPurchaseReturnDto;
import com.pms.pharmacy.dto.PharmacyPurchaseReturnEligibleItemDto;
import com.pms.pharmacy.dto.PharmacyPurchaseReturnRequest;
import com.pms.pharmacy.dto.PharmacyPurchaseReturnSummaryDto;
import com.pms.pharmacy.service.PharmacyPurchaseReturnService;
import jakarta.validation.Valid;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pharmacy/purchase-returns")
public class PharmacyPurchaseReturnController {

    private final PharmacyPurchaseReturnService service;

    public PharmacyPurchaseReturnController(PharmacyPurchaseReturnService service) {
        this.service = service;
    }

    @GetMapping("/eligible-stock")
    public List<PharmacyPurchaseReturnEligibleItemDto> eligibleStock(
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String drugName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return service.findEligibleStock(supplierId, drugName, fromDate, toDate);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PharmacyPurchaseReturnDto create(@Valid @RequestBody PharmacyPurchaseReturnRequest request) {
        return service.create(request);
    }

    @GetMapping("/{id}")
    public PharmacyPurchaseReturnDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping
    public List<PharmacyPurchaseReturnSummaryDto> search(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        Instant fromInstant = fromDate != null ? fromDate.atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        Instant toInstant = toDate != null ? toDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        return service.search(fromInstant, toInstant);
    }
}
