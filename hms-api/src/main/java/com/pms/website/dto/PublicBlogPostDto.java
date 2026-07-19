package com.pms.website.dto;

import java.time.Instant;

/** Public-safe projection of CmsBlogPost - Blogs page and blog permalinks. */
public record PublicBlogPostDto(
        Long id,
        String title,
        String slug,
        String body,
        String imageUrl,
        Instant publishedAt) {
}
