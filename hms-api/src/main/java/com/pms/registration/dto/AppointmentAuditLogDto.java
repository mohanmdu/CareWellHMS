package com.pms.registration.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentAuditLogDto(
        Long id,
        String operation,
        String patientName,
        String consultantName,
        String departmentName,
        LocalDate appointmentDate,
        LocalTime slotTime,
        String channel,
        String previousValue,
        String newValue,
        String performedBy,
        Instant performedAt) {
}
