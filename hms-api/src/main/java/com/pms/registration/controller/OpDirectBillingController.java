package com.pms.registration.controller;

import com.pms.registration.dto.OpDirectBillingListEntryDto;
import com.pms.registration.dto.OpDirectBillingReceiptDto;
import com.pms.registration.dto.OpDirectBillingRequest;
import com.pms.registration.service.OpDirectBillingService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/registration/op-direct-billing")
public class OpDirectBillingController {

    private final OpDirectBillingService service;

    public OpDirectBillingController(OpDirectBillingService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OpDirectBillingReceiptDto create(@Valid @RequestBody OpDirectBillingRequest request) {
        return service.create(request);
    }

    @GetMapping
    public List<OpDirectBillingListEntryDto> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return service.findAll(fromDate, toDate);
    }

    @GetMapping("/{id}")
    public OpDirectBillingReceiptDto get(@PathVariable Long id) {
        return service.findById(id);
    }
}
