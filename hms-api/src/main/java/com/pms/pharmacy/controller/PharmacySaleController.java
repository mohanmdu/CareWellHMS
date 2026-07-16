package com.pms.pharmacy.controller;

import com.pms.pharmacy.dto.PharmacySaleDto;
import com.pms.pharmacy.dto.PharmacySaleListEntryDto;
import com.pms.pharmacy.dto.PharmacySalePaymentRequest;
import com.pms.pharmacy.dto.PharmacySaleRequest;
import com.pms.pharmacy.entity.PharmacyPaymentMode;
import com.pms.pharmacy.entity.PharmacySaleSource;
import com.pms.pharmacy.service.PharmacySaleService;
import jakarta.validation.Valid;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pharmacy/sales")
public class PharmacySaleController {

    private final PharmacySaleService service;

    public PharmacySaleController(PharmacySaleService service) {
        this.service = service;
    }

    @GetMapping
    public List<PharmacySaleListEntryDto> search(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) PharmacySaleSource source,
            @RequestParam(required = false) PharmacyPaymentMode paymentMode,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) String billedBy) {
        Instant fromInstant = fromDate != null ? fromDate.atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        Instant toInstant = toDate != null ? toDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        return service.search(fromInstant, toInstant, source, paymentMode, locationId, billedBy);
    }

    @GetMapping("/due")
    public List<PharmacySaleListEntryDto> due(
            @RequestParam(required = false) PharmacySaleSource source,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) String pid,
            @RequestParam(required = false) String nameOrMobile) {
        return service.findDue(source, locationId, pid, nameOrMobile);
    }

    @GetMapping("/{id}")
    public PharmacySaleDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PharmacySaleDto create(@Valid @RequestBody PharmacySaleRequest request) {
        return service.create(request);
    }

    @PatchMapping("/{id}/payment")
    public PharmacySaleDto pay(@PathVariable Long id, @Valid @RequestBody PharmacySalePaymentRequest request) {
        return service.pay(id, request);
    }
}
