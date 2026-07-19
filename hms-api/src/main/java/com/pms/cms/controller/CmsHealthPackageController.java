package com.pms.cms.controller;

import com.pms.cms.dto.CmsHealthPackageDto;
import com.pms.cms.service.CmsHealthPackageService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/masters/cms/health-packages")
public class CmsHealthPackageController {

    private final CmsHealthPackageService service;

    public CmsHealthPackageController(CmsHealthPackageService service) {
        this.service = service;
    }

    @GetMapping
    public List<CmsHealthPackageDto> list() {
        return service.findActive();
    }

    @GetMapping("/inactive")
    public List<CmsHealthPackageDto> listInactive() {
        return service.findInactive();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CmsHealthPackageDto create(@Valid @RequestBody CmsHealthPackageDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public CmsHealthPackageDto update(@PathVariable Long id, @Valid @RequestBody CmsHealthPackageDto dto) {
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
