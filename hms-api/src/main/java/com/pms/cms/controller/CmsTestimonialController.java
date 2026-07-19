package com.pms.cms.controller;

import com.pms.cms.dto.CmsTestimonialDto;
import com.pms.cms.service.CmsTestimonialService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/masters/cms/testimonials")
public class CmsTestimonialController {

    private final CmsTestimonialService service;

    public CmsTestimonialController(CmsTestimonialService service) {
        this.service = service;
    }

    @GetMapping
    public List<CmsTestimonialDto> list() {
        return service.findActive();
    }

    @GetMapping("/inactive")
    public List<CmsTestimonialDto> listInactive() {
        return service.findInactive();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CmsTestimonialDto create(@Valid @RequestBody CmsTestimonialDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public CmsTestimonialDto update(@PathVariable Long id, @Valid @RequestBody CmsTestimonialDto dto) {
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
    public CmsTestimonialDto uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return service.uploadImage(id, file);
    }
}
