package com.pms.website.controller;

import com.pms.website.dto.PublicConfigDto;
import com.pms.website.service.PublicConfigService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Unauthenticated - the future public website's first API call (see SecurityConfig). */
@RestController
@RequestMapping("/api/public/config")
public class PublicConfigController {

    private final PublicConfigService service;

    public PublicConfigController(PublicConfigService service) {
        this.service = service;
    }

    @GetMapping
    public PublicConfigDto get() {
        return service.get();
    }
}
