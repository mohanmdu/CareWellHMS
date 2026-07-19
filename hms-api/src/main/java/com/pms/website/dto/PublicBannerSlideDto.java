package com.pms.website.dto;

/** Public-safe projection of CmsBannerSlide - homepage carousel slides. */
public record PublicBannerSlideDto(
        Long id,
        String title,
        String subtitle,
        String imageUrl,
        String linkUrl,
        Integer sortOrder) {
}
