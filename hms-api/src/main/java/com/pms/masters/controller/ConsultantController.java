package com.pms.masters.controller;

import com.pms.masters.dto.ConsultantDto;
import com.pms.masters.service.ConsultantService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/masters/consultants")
public class ConsultantController {

    private final ConsultantService service;

    public ConsultantController(ConsultantService service) {
        this.service = service;
    }

    @GetMapping
    public List<ConsultantDto> list() {
        return service.findActive();
    }

    @GetMapping("/inactive")
    public List<ConsultantDto> inactive() {
        return service.findInactive();
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

    @PatchMapping("/{id}/restore")
    public ResponseEntity<Void> restore(@PathVariable Long id) {
        service.restore(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<Void> publish(@PathVariable Long id) {
        service.publish(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/unpublish")
    public ResponseEntity<Void> unpublish(@PathVariable Long id) {
        service.unpublish(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/image")
    public ConsultantDto uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return service.uploadImage(id, file);
    }
}
