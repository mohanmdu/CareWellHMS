package com.pms.lab.controller;

import com.pms.lab.dto.LabRefundCandidateDto;
import com.pms.lab.dto.LabRefundReceiptEntryDto;
import com.pms.lab.dto.LabRefundRequestDto;
import com.pms.lab.service.LabRefundService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lab/refunds")
public class LabRefundController {

    private final LabRefundService service;

    public LabRefundController(LabRefundService service) {
        this.service = service;
    }

    @GetMapping("/search")
    public LabRefundCandidateDto search(@RequestParam Long invoiceNumber) {
        return service.searchByInvoiceNumber(invoiceNumber);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LabRefundReceiptEntryDto create(@Valid @RequestBody LabRefundRequestDto request) {
        return service.create(request);
    }

    @GetMapping("/{id}")
    public LabRefundReceiptEntryDto get(@PathVariable Long id) {
        return service.getReceipt(id);
    }

    @GetMapping("/report")
    public List<LabRefundReceiptEntryDto> report(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.report(from, to);
    }
}
