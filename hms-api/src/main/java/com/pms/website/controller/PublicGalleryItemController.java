package com.pms.website.controller;

import com.pms.cms.entity.CmsGalleryItemType;
import com.pms.website.dto.PublicGalleryItemDto;
import com.pms.website.service.PublicGalleryItemService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Unauthenticated - drives the public website's Gallery/Videos pages (see SecurityConfig). */
@RestController
@RequestMapping("/api/public/cms/gallery-items")
public class PublicGalleryItemController {

    private final PublicGalleryItemService service;

    public PublicGalleryItemController(PublicGalleryItemService service) {
        this.service = service;
    }

    @GetMapping
    public List<PublicGalleryItemDto> list(@RequestParam(required = false) CmsGalleryItemType type) {
        return service.list(type);
    }
}
