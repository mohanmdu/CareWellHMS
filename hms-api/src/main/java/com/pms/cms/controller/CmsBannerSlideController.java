package com.pms.cms.controller;

import com.pms.cms.dto.CmsBannerSlideDto;
import com.pms.cms.service.CmsBannerSlideService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/masters/cms/banner-slides")
public class CmsBannerSlideController {

    private final CmsBannerSlideService service;

    public CmsBannerSlideController(CmsBannerSlideService service) {
        this.service = service;
    }

    @GetMapping
    public List<CmsBannerSlideDto> list() {
        return service.findActive();
    }

    @GetMapping("/inactive")
    public List<CmsBannerSlideDto> listInactive() {
        return service.findInactive();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CmsBannerSlideDto create(@Valid @RequestBody CmsBannerSlideDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public CmsBannerSlideDto update(@PathVariable Long id, @Valid @RequestBody CmsBannerSlideDto dto) {
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
    public CmsBannerSlideDto uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return service.uploadImage(id, file);
    }
}
