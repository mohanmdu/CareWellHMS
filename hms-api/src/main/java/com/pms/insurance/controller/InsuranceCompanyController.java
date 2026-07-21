package com.pms.insurance.controller;

import com.pms.insurance.dto.InsuranceCompanyDto;
import com.pms.insurance.service.InsuranceCompanyService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/insurance/companies")
public class InsuranceCompanyController {

    private final InsuranceCompanyService service;

    public InsuranceCompanyController(InsuranceCompanyService service) {
        this.service = service;
    }

    @GetMapping
    public List<InsuranceCompanyDto> list() {
        return service.findActive();
    }

    @GetMapping("/inactive")
    public List<InsuranceCompanyDto> listInactive() {
        return service.findInactive();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InsuranceCompanyDto create(@Valid @RequestBody InsuranceCompanyDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public InsuranceCompanyDto update(@PathVariable Long id, @Valid @RequestBody InsuranceCompanyDto dto) {
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
