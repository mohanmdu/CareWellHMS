package com.pms.pharmacy.controller;

import com.pms.pharmacy.dto.GrnDto;
import com.pms.pharmacy.dto.GrnListEntryDto;
import com.pms.pharmacy.dto.GrnRequest;
import com.pms.pharmacy.entity.GrnStatus;
import com.pms.pharmacy.service.GrnService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pharmacy/grns")
public class GrnController {

    private final GrnService service;

    public GrnController(GrnService service) {
        this.service = service;
    }

    @GetMapping
    public List<GrnListEntryDto> list(@RequestParam(required = false) GrnStatus status) {
        return status != null ? service.findByStatus(status) : service.findAll();
    }

    @GetMapping("/{id}")
    public GrnDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GrnDto create(@Valid @RequestBody GrnRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public GrnDto update(@PathVariable Long id, @Valid @RequestBody GrnRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
