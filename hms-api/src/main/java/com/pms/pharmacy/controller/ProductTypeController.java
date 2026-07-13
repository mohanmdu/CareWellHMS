package com.pms.pharmacy.controller;

import com.pms.pharmacy.dto.ProductTypeDto;
import com.pms.pharmacy.service.ProductTypeService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pharmacy/product-types")
public class ProductTypeController {

    private final ProductTypeService service;

    public ProductTypeController(ProductTypeService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProductTypeDto> list() {
        return service.findActive();
    }

    @GetMapping("/inactive")
    public List<ProductTypeDto> listInactive() {
        return service.findInactive();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductTypeDto create(@Valid @RequestBody ProductTypeDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public ProductTypeDto update(@PathVariable Long id, @Valid @RequestBody ProductTypeDto dto) {
        return service.update(id, dto);
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<Void> restore(@PathVariable Long id) {
        service.restore(id);
        return ResponseEntity.noContent().build();
    }
}
