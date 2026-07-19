package com.pms.icd.dto;

import com.pms.icd.entity.IcdVersion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record IcdCodeDto(
        Long id,
        @NotNull IcdVersion version,
        @NotBlank String code,
        @NotBlank String diseaseName,
        String chapter,
        String category,
        String whoVersion,
        String shortDescription,
        Boolean active,
        Instant createdAt,
        String createdBy,
        Instant updatedAt,
        String updatedBy) {
}
