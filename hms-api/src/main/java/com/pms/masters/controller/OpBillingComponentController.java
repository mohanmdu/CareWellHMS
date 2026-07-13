package com.pms.masters.controller;

import com.pms.masters.dto.OpBillingComponentDto;
import com.pms.masters.service.OpBillingComponentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/masters/op-billing-components")
public class OpBillingComponentController {

    private final OpBillingComponentService service;

    public OpBillingComponentController(OpBillingComponentService service) {
        this.service = service;
    }

    @GetMapping
    public List<OpBillingComponentDto> list() {
        return service.findActive();
    }

    @GetMapping("/inactive")
    public List<OpBillingComponentDto> listInactive() {
        return service.findInactive();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OpBillingComponentDto create(@Valid @RequestBody OpBillingComponentDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public OpBillingComponentDto update(@PathVariable Long id, @Valid @RequestBody OpBillingComponentDto dto) {
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
