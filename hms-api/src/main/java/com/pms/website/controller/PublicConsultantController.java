package com.pms.website.controller;

import com.pms.website.dto.PublicConsultantDto;
import com.pms.website.service.PublicConsultantService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Unauthenticated - drives the public website's Doctor Listing/Profile pages (see SecurityConfig). */
@RestController
@RequestMapping("/api/public/consultants")
public class PublicConsultantController {

    private final PublicConsultantService service;

    public PublicConsultantController(PublicConsultantService service) {
        this.service = service;
    }

    @GetMapping
    public List<PublicConsultantDto> list(@RequestParam(required = false) Long departmentId) {
        return service.list(departmentId);
    }

    @GetMapping("/{id}")
    public PublicConsultantDto get(@PathVariable Long id) {
        return service.get(id);
    }
}
