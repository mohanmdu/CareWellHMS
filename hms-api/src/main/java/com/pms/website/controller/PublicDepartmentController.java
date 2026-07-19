package com.pms.website.controller;

import com.pms.website.dto.PublicDepartmentDto;
import com.pms.website.service.PublicDepartmentService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Unauthenticated - drives the public website's Departments page (see SecurityConfig). */
@RestController
@RequestMapping("/api/public/departments")
public class PublicDepartmentController {

    private final PublicDepartmentService service;

    public PublicDepartmentController(PublicDepartmentService service) {
        this.service = service;
    }

    @GetMapping
    public List<PublicDepartmentDto> list() {
        return service.list();
    }
}
