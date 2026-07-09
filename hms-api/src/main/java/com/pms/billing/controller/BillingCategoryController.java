package com.pms.billing.controller;

import com.pms.billing.dto.BillingCategoryDto;
import com.pms.billing.service.BillingCategoryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/billing/categories")
public class BillingCategoryController {

    private final BillingCategoryService service;

    public BillingCategoryController(BillingCategoryService service) {
        this.service = service;
    }

    @GetMapping
    public List<BillingCategoryDto> list() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BillingCategoryDto create(@Valid @RequestBody BillingCategoryDto dto) {
        return service.create(dto);
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
