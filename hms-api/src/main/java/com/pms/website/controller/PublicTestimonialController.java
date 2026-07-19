package com.pms.website.controller;

import com.pms.website.dto.PublicTestimonialDto;
import com.pms.website.service.PublicTestimonialService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Unauthenticated - drives the public website's Testimonials page (see SecurityConfig). */
@RestController
@RequestMapping("/api/public/cms/testimonials")
public class PublicTestimonialController {

    private final PublicTestimonialService service;

    public PublicTestimonialController(PublicTestimonialService service) {
        this.service = service;
    }

    @GetMapping
    public List<PublicTestimonialDto> list() {
        return service.list();
    }
}
