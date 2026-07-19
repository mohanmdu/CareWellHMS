package com.pms.cms.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.time.LocalDate;

public record CmsNewsEventDto(
        Long id,
        @NotBlank String title,
        String body,
        LocalDate eventDate,
        String coverImagePath,
        Instant publishedAt,
        Boolean active) {
}
