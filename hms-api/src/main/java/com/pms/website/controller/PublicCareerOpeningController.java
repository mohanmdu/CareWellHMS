package com.pms.website.controller;

import com.pms.website.dto.PublicCareerOpeningDto;
import com.pms.website.service.PublicCareerOpeningService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Unauthenticated - drives the public website's Careers page (see SecurityConfig). */
@RestController
@RequestMapping("/api/public/cms/career-openings")
public class PublicCareerOpeningController {

    private final PublicCareerOpeningService service;

    public PublicCareerOpeningController(PublicCareerOpeningService service) {
        this.service = service;
    }

    @GetMapping
    public List<PublicCareerOpeningDto> list() {
        return service.list();
    }
}
