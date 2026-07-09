package com.pms.registration.dto;

import java.time.Instant;

public record PatientAuditLogDto(Long id, String operation, String patientName, String performedBy, Instant performedAt) {
}
