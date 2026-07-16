package com.pms.pharmacy.controller;

import com.pms.pharmacy.dto.PharmacyStockTransactionDto;
import com.pms.pharmacy.dto.PharmacyStockTransactionRequest;
import com.pms.pharmacy.entity.PharmacyStockTransactionType;
import com.pms.pharmacy.service.PharmacyStockTransactionService;
import jakarta.validation.Valid;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pharmacy/stock/transactions")
public class PharmacyStockTransactionController {

    private final PharmacyStockTransactionService service;

    public PharmacyStockTransactionController(PharmacyStockTransactionService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PharmacyStockTransactionDto create(@Valid @RequestBody PharmacyStockTransactionRequest request) {
        return service.create(request);
    }

    @GetMapping
    public List<PharmacyStockTransactionDto> search(
            @RequestParam PharmacyStockTransactionType type,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        Instant fromInstant = fromDate != null ? fromDate.atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        Instant toInstant = toDate != null ? toDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        return service.search(type, locationId, fromInstant, toInstant);
    }
}
