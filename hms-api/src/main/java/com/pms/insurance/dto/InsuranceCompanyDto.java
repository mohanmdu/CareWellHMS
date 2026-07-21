package com.pms.insurance.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

public record InsuranceCompanyDto(
        Long id,
        @NotBlank String insuranceType,
        @NotBlank String companyName,
        Boolean active,
        Instant createdAt,
        String createdBy,
        Instant updatedAt,
        String updatedBy,
        Instant deactivatedAt,
        String deactivatedBy) {
}
