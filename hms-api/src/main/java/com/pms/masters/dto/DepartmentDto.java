package com.pms.masters.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

public record DepartmentDto(
        Long id,
        @NotBlank String name,
        Boolean active,
        Instant createdAt,
        String createdBy,
        Instant deactivatedAt,
        String deactivatedBy,
        Long consultantCount) {
}
