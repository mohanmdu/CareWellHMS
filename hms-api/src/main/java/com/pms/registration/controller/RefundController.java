package com.pms.registration.controller;

import com.pms.registration.dto.RefundCandidateDto;
import com.pms.registration.dto.RefundReceiptEntryDto;
import com.pms.registration.dto.RefundRequest;
import com.pms.registration.service.RefundService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/registration/refunds")
public class RefundController {

    private final RefundService service;

    public RefundController(RefundService service) {
        this.service = service;
    }

    @GetMapping("/search")
    public RefundCandidateDto search(@RequestParam Long invoiceNumber) {
        return service.searchByInvoiceNumber(invoiceNumber);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RefundReceiptEntryDto create(@Valid @RequestBody RefundRequest request) {
        return service.create(request);
    }

    @GetMapping("/report")
    public List<RefundReceiptEntryDto> report(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long consultantId) {
        return service.report(fromDate, toDate, consultantId);
    }
}
