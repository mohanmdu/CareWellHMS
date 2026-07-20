package com.pms.lab.controller;

import com.pms.lab.dto.LabSubCategoryDto;
import com.pms.lab.service.LabSubCategoryService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lab/sub-categories")
public class LabSubCategoryController {

    private final LabSubCategoryService service;

    public LabSubCategoryController(LabSubCategoryService service) {
        this.service = service;
    }

    @GetMapping
    public List<LabSubCategoryDto> list() {
        return service.findAll();
    }

    @GetMapping("/search")
    public List<LabSubCategoryDto> search(@RequestParam("q") String query, @RequestParam(required = false) Long categoryId) {
        return service.search(query, categoryId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LabSubCategoryDto create(@Valid @RequestBody LabSubCategoryDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public LabSubCategoryDto update(@PathVariable Long id, @Valid @RequestBody LabSubCategoryDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
