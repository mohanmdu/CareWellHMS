package com.pms.cms.dto;

import jakarta.validation.constraints.NotBlank;

public record CmsBannerSlideDto(
        Long id, @NotBlank String title, String subtitle, String imagePath, String linkUrl, Integer sortOrder, Boolean active) {
}
