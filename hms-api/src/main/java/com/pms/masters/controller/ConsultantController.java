package com.pms.masters.controller;

import com.pms.masters.dto.ConsultantDto;
import com.pms.masters.service.ConsultantService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/masters/consultants")
public class ConsultantController {

    private final ConsultantService service;

    public ConsultantController(ConsultantService service) {
        this.service = service;
    }

    @GetMapping
    public List<ConsultantDto> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ConsultantDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ConsultantDto create(@Valid @RequestBody ConsultantDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public ConsultantDto update(@PathVariable Long id, @Valid @RequestBody ConsultantDto dto) {
        return service.update(id, dto);
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
