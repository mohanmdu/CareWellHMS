package com.pms.settings.dto;

import jakarta.validation.constraints.NotBlank;

public record ClinicSettingsDto(
        @NotBlank String name, String address, String phone, String email, String logoUrl) {
}
