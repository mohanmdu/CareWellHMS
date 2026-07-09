package com.pms.masters.controller;

import com.pms.masters.dto.DepartmentDto;
import com.pms.masters.service.DepartmentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST equivalent of the legacy getDepartments / addDepartment / deptEdit /
 * updateDept / deptDeactivate Struts actions (migration doc §4.6, §5 example table).
 */
@RestController
@RequestMapping("/api/masters/departments")
public class DepartmentController {

    private final DepartmentService service;

    public DepartmentController(DepartmentService service) {
        this.service = service;
    }

    @GetMapping
    public List<DepartmentDto> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public DepartmentDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DepartmentDto create(@Valid @RequestBody DepartmentDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public DepartmentDto update(@PathVariable Long id, @Valid @RequestBody DepartmentDto dto) {
        return service.update(id, dto);
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
