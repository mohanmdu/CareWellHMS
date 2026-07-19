package com.pms.cms.controller;

import com.pms.cms.dto.CmsBlogPostDto;
import com.pms.cms.service.CmsBlogPostService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/masters/cms/blog-posts")
public class CmsBlogPostController {

    private final CmsBlogPostService service;

    public CmsBlogPostController(CmsBlogPostService service) {
        this.service = service;
    }

    @GetMapping
    public List<CmsBlogPostDto> list() {
        return service.findActive();
    }

    @GetMapping("/inactive")
    public List<CmsBlogPostDto> listInactive() {
        return service.findInactive();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CmsBlogPostDto create(@Valid @RequestBody CmsBlogPostDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public CmsBlogPostDto update(@PathVariable Long id, @Valid @RequestBody CmsBlogPostDto dto) {
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
    public CmsBlogPostDto uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return service.uploadImage(id, file);
    }
}
