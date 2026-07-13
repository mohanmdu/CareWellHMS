package com.pms.pharmacy.controller;

import com.pms.pharmacy.dto.RackDto;
import com.pms.pharmacy.service.RackService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pharmacy/racks")
public class RackController {

    private final RackService service;

    public RackController(RackService service) {
        this.service = service;
    }

    @GetMapping
    public List<RackDto> list() {
        return service.findActive();
    }

    @GetMapping("/inactive")
    public List<RackDto> listInactive() {
        return service.findInactive();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RackDto create(@Valid @RequestBody RackDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public RackDto update(@PathVariable Long id, @Valid @RequestBody RackDto dto) {
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
