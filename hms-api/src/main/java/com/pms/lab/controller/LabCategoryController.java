package com.pms.lab.controller;

import com.pms.lab.dto.LabCategoryDto;
import com.pms.lab.service.LabCategoryService;
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
@RequestMapping("/api/lab/categories")
public class LabCategoryController {

    private final LabCategoryService service;

    public LabCategoryController(LabCategoryService service) {
        this.service = service;
    }

    @GetMapping
    public List<LabCategoryDto> list() {
        return service.findAll();
    }

    @GetMapping("/search")
    public List<LabCategoryDto> search(@RequestParam("q") String query) {
        return service.search(query);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LabCategoryDto create(@Valid @RequestBody LabCategoryDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public LabCategoryDto update(@PathVariable Long id, @Valid @RequestBody LabCategoryDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
