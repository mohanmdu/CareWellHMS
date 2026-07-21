package com.pms.registration.dto;

import jakarta.validation.constraints.NotBlank;

public record PatientReportDeleteRequestDto(@NotBlank String reason) {
}
