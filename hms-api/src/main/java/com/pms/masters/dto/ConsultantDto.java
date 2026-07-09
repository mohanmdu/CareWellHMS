package com.pms.masters.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record ConsultantDto(
        Long id,
        @NotBlank String name,
        @NotNull Long departmentId,
        String departmentName,
        String specialization,
        String email,
        String mobileNumber,
        @PositiveOrZero Double consultationFee,
        Boolean active) {
}
