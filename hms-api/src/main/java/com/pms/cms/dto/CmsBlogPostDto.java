package com.pms.cms.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

public record CmsBlogPostDto(
        Long id, @NotBlank String title, @NotBlank String slug, String body, String coverImagePath, Instant publishedAt, Boolean active) {
}
