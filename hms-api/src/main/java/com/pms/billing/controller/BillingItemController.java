package com.pms.billing.controller;

import com.pms.billing.dto.BillingItemDto;
import com.pms.billing.service.BillingItemService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/billing/items")
public class BillingItemController {

    private final BillingItemService service;

    public BillingItemController(BillingItemService service) {
        this.service = service;
    }

    @GetMapping
    public List<BillingItemDto> list() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BillingItemDto create(@Valid @RequestBody BillingItemDto dto) {
        return service.create(dto);
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
