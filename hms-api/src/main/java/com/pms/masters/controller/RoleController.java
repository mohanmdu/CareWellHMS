package com.pms.masters.controller;

import com.pms.masters.dto.RoleDto;
import com.pms.masters.service.RoleService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/masters/roles")
public class RoleController {

    private final RoleService service;

    public RoleController(RoleService service) {
        this.service = service;
    }

    @GetMapping
    public List<RoleDto> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public RoleDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoleDto create(@Valid @RequestBody RoleDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public RoleDto update(@PathVariable Long id, @Valid @RequestBody RoleDto dto) {
        return service.update(id, dto);
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
