package com.pms.billing.controller;

import com.pms.billing.dto.InvoiceDto;
import com.pms.billing.service.InvoiceService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * Replaces the legacy OP billing/receipt Struts actions (getOPBillingCategory,
 * addopbillingcategory, CashierOPBillingInvoice, cancelPayment/cancelPayment1
 * - migration doc §4.1).
 */
@RestController
@RequestMapping("/api/billing/invoices")
public class InvoiceController {

    private final InvoiceService service;

    public InvoiceController(InvoiceService service) {
        this.service = service;
    }

    @GetMapping
    public List<InvoiceDto> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public InvoiceDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InvoiceDto create(@Valid @RequestBody InvoiceDto dto) {
        return service.create(dto);
    }

    @PatchMapping("/{id}/pay")
    public InvoiceDto pay(@PathVariable Long id) {
        return service.pay(id);
    }

    @PatchMapping("/{id}/cancel")
    public InvoiceDto cancel(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.cancel(id, body.get("reason"));
    }
}
