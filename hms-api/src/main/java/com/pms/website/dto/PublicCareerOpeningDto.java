package com.pms.website.dto;

/** Public-safe projection of CmsCareerOpening - Careers page. */
public record PublicCareerOpeningDto(
        Long id,
        String title,
        Long departmentId,
        String departmentName,
        String description,
        String applyEmail) {
}
