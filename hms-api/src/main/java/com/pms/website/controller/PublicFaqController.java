package com.pms.website.controller;

import com.pms.website.dto.PublicFaqDto;
import com.pms.website.service.PublicFaqService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Unauthenticated - drives the public website's FAQ page (see SecurityConfig). */
@RestController
@RequestMapping("/api/public/cms/faqs")
public class PublicFaqController {

    private final PublicFaqService service;

    public PublicFaqController(PublicFaqService service) {
        this.service = service;
    }

    @GetMapping
    public List<PublicFaqDto> list() {
        return service.list();
    }
}
