package com.pms.website.controller;

import com.pms.website.dto.PublicBlogPostDto;
import com.pms.website.service.PublicBlogPostService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Unauthenticated - drives the public website's Blogs page and permalinks (see SecurityConfig). */
@RestController
@RequestMapping("/api/public/cms/blog-posts")
public class PublicBlogPostController {

    private final PublicBlogPostService service;

    public PublicBlogPostController(PublicBlogPostService service) {
        this.service = service;
    }

    @GetMapping
    public List<PublicBlogPostDto> list() {
        return service.list();
    }

    @GetMapping("/{slug}")
    public PublicBlogPostDto getBySlug(@PathVariable String slug) {
        return service.getBySlug(slug);
    }
}
