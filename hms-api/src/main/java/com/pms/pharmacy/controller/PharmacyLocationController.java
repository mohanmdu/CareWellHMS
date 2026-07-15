package com.pms.pharmacy.controller;

import com.pms.pharmacy.dto.PharmacyLocationDto;
import com.pms.pharmacy.service.PharmacyLocationService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pharmacy/locations")
public class PharmacyLocationController {

    private final PharmacyLocationService service;

    public PharmacyLocationController(PharmacyLocationService service) {
        this.service = service;
    }

    @GetMapping
    public List<PharmacyLocationDto> list() {
        return service.findActive();
    }

    @GetMapping("/inactive")
    public List<PharmacyLocationDto> listInactive() {
        return service.findInactive();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PharmacyLocationDto create(@Valid @RequestBody PharmacyLocationDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public PharmacyLocationDto update(@PathVariable Long id, @Valid @RequestBody PharmacyLocationDto dto) {
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
