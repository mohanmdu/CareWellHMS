package com.pms.website.controller;

import com.pms.website.dto.PublicSiteContentDto;
import com.pms.website.service.PublicSiteContentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Unauthenticated - drives the public website's Home/About pages (see SecurityConfig). */
@RestController
@RequestMapping("/api/public/cms/site-content")
public class PublicSiteContentController {

    private final PublicSiteContentService service;

    public PublicSiteContentController(PublicSiteContentService service) {
        this.service = service;
    }

    @GetMapping
    public PublicSiteContentDto get() {
        return service.get();
    }
}
