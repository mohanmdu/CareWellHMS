package com.pms.website.controller;

import com.pms.website.dto.PublicNewsEventDto;
import com.pms.website.service.PublicNewsEventService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Unauthenticated - drives the public website's News & Events page (see SecurityConfig). */
@RestController
@RequestMapping("/api/public/cms/news-events")
public class PublicNewsEventController {

    private final PublicNewsEventService service;

    public PublicNewsEventController(PublicNewsEventService service) {
        this.service = service;
    }

    @GetMapping
    public List<PublicNewsEventDto> list() {
        return service.list();
    }
}
