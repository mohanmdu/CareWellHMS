package com.pms.registration.dto;

import com.pms.registration.entity.CancelledBy;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CancelAppointmentRequest(@NotBlank String reason, @NotNull CancelledBy cancelledBy) {
}
