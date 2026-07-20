package com.pms.lab.controller;

import com.pms.lab.dto.LabComponentDto;
import com.pms.lab.service.LabComponentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lab/components")
public class LabComponentController {

    private final LabComponentService service;

    public LabComponentController(LabComponentService service) {
        this.service = service;
    }

    @GetMapping
    public List<LabComponentDto> list() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LabComponentDto create(@Valid @RequestBody LabComponentDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public LabComponentDto update(@PathVariable Long id, @Valid @RequestBody LabComponentDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
