package com.pms.website.dto;

import java.time.Instant;
import java.time.LocalDate;

/** Public-safe projection of CmsNewsEvent - News & Events page. */
public record PublicNewsEventDto(
        Long id,
        String title,
        String body,
        LocalDate eventDate,
        String imageUrl,
        Instant publishedAt) {
}
