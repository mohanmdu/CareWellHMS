package com.pms.masters.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.Instant;

public record GeneralUserDto(
        Long id,
        @NotBlank String name,
        @NotBlank @Pattern(regexp = "\\d{10}", message = "Mobile number must be exactly 10 digits") String mobileNumber,
        String email,
        @NotNull Long roleId,
        String roleName,
        Boolean active,
        Instant createdAt,
        String createdBy,
        Instant deactivatedAt,
        String deactivatedBy) {
}
