package com.pms.masters.controller;

import com.pms.masters.dto.IpBillingComponentDto;
import com.pms.masters.service.IpBillingComponentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/masters/ip-billing-components")
public class IpBillingComponentController {

    private final IpBillingComponentService service;

    public IpBillingComponentController(IpBillingComponentService service) {
        this.service = service;
    }

    @GetMapping
    public List<IpBillingComponentDto> list() {
        return service.findActive();
    }

    @GetMapping("/inactive")
    public List<IpBillingComponentDto> listInactive() {
        return service.findInactive();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IpBillingComponentDto create(@Valid @RequestBody IpBillingComponentDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public IpBillingComponentDto update(@PathVariable Long id, @Valid @RequestBody IpBillingComponentDto dto) {
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
