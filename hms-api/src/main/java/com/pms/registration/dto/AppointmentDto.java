package com.pms.registration.dto;

import com.pms.registration.entity.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentDto(
        Long id,
        @NotNull Long patientId,
        String patientName,
        @NotNull Long consultantId,
        String consultantName,
        String departmentName,
        @NotNull LocalDate appointmentDate,
        @NotNull LocalTime slotTime,
        AppointmentStatus status,
        String notes,
        String cancellationReason) {
}
