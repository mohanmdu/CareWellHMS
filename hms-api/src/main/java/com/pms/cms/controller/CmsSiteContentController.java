package com.pms.cms.controller;

import com.pms.cms.dto.CmsSiteContentDto;
import com.pms.cms.service.CmsSiteContentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/masters/cms/site-content")
public class CmsSiteContentController {

    private final CmsSiteContentService service;

    public CmsSiteContentController(CmsSiteContentService service) {
        this.service = service;
    }

    @GetMapping
    public CmsSiteContentDto get() {
        return service.get();
    }

    @PutMapping
    public CmsSiteContentDto update(@Valid @RequestBody CmsSiteContentDto dto) {
        return service.update(dto);
    }
}
