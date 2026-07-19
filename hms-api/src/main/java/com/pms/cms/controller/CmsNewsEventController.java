package com.pms.cms.controller;

import com.pms.cms.dto.CmsNewsEventDto;
import com.pms.cms.service.CmsNewsEventService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/masters/cms/news-events")
public class CmsNewsEventController {

    private final CmsNewsEventService service;

    public CmsNewsEventController(CmsNewsEventService service) {
        this.service = service;
    }

    @GetMapping
    public List<CmsNewsEventDto> list() {
        return service.findActive();
    }

    @GetMapping("/inactive")
    public List<CmsNewsEventDto> listInactive() {
        return service.findInactive();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CmsNewsEventDto create(@Valid @RequestBody CmsNewsEventDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public CmsNewsEventDto update(@PathVariable Long id, @Valid @RequestBody CmsNewsEventDto dto) {
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

    @PostMapping("/{id}/image")
    public CmsNewsEventDto uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return service.uploadImage(id, file);
    }
}
