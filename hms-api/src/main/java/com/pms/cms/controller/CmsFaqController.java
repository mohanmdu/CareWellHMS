package com.pms.cms.controller;

import com.pms.cms.dto.CmsFaqDto;
import com.pms.cms.service.CmsFaqService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/masters/cms/faqs")
public class CmsFaqController {

    private final CmsFaqService service;

    public CmsFaqController(CmsFaqService service) {
        this.service = service;
    }

    @GetMapping
    public List<CmsFaqDto> list() {
        return service.findActive();
    }

    @GetMapping("/inactive")
    public List<CmsFaqDto> listInactive() {
        return service.findInactive();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CmsFaqDto create(@Valid @RequestBody CmsFaqDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public CmsFaqDto update(@PathVariable Long id, @Valid @RequestBody CmsFaqDto dto) {
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
