package com.pms.website.controller;

import com.pms.website.dto.PublicBannerSlideDto;
import com.pms.website.service.PublicBannerSlideService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Unauthenticated - drives the public website's homepage carousel (see SecurityConfig). */
@RestController
@RequestMapping("/api/public/cms/banner-slides")
public class PublicBannerSlideController {

    private final PublicBannerSlideService service;

    public PublicBannerSlideController(PublicBannerSlideService service) {
        this.service = service;
    }

    @GetMapping
    public List<PublicBannerSlideDto> list() {
        return service.list();
    }
}
