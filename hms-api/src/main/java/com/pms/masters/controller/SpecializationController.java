package com.pms.masters.controller;

import com.pms.masters.dto.SpecializationDto;
import com.pms.masters.service.SpecializationService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/masters/specializations")
public class SpecializationController {

    private final SpecializationService service;

    public SpecializationController(SpecializationService service) {
        this.service = service;
    }

    @GetMapping
    public List<SpecializationDto> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public SpecializationDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SpecializationDto create(@Valid @RequestBody SpecializationDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public SpecializationDto update(@PathVariable Long id, @Valid @RequestBody SpecializationDto dto) {
        return service.update(id, dto);
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
