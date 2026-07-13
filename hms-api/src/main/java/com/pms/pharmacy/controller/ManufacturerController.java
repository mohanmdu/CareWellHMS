package com.pms.pharmacy.controller;

import com.pms.pharmacy.dto.ManufacturerDto;
import com.pms.pharmacy.service.ManufacturerService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pharmacy/manufacturers")
public class ManufacturerController {

    private final ManufacturerService service;

    public ManufacturerController(ManufacturerService service) {
        this.service = service;
    }

    @GetMapping
    public List<ManufacturerDto> list() {
        return service.findActive();
    }

    @GetMapping("/inactive")
    public List<ManufacturerDto> listInactive() {
        return service.findInactive();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ManufacturerDto create(@Valid @RequestBody ManufacturerDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public ManufacturerDto update(@PathVariable Long id, @Valid @RequestBody ManufacturerDto dto) {
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
