package com.pms.cms.controller;

import com.pms.cms.dto.CmsCareerOpeningDto;
import com.pms.cms.service.CmsCareerOpeningService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/masters/cms/career-openings")
public class CmsCareerOpeningController {

    private final CmsCareerOpeningService service;

    public CmsCareerOpeningController(CmsCareerOpeningService service) {
        this.service = service;
    }

    @GetMapping
    public List<CmsCareerOpeningDto> list() {
        return service.findActive();
    }

    @GetMapping("/inactive")
    public List<CmsCareerOpeningDto> listInactive() {
        return service.findInactive();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CmsCareerOpeningDto create(@Valid @RequestBody CmsCareerOpeningDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public CmsCareerOpeningDto update(@PathVariable Long id, @Valid @RequestBody CmsCareerOpeningDto dto) {
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
