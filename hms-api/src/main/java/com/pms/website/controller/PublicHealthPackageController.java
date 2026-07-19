package com.pms.website.controller;

import com.pms.website.dto.PublicHealthPackageDto;
import com.pms.website.service.PublicHealthPackageService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Unauthenticated - drives the public website's Health Packages page (see SecurityConfig). */
@RestController
@RequestMapping("/api/public/cms/health-packages")
public class PublicHealthPackageController {

    private final PublicHealthPackageService service;

    public PublicHealthPackageController(PublicHealthPackageService service) {
        this.service = service;
    }

    @GetMapping
    public List<PublicHealthPackageDto> list() {
        return service.list();
    }
}
