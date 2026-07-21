package com.pms.registration.dto;

import java.time.LocalDateTime;

/**
 * One row of the Audit Log for Medical Reports (Patient or Doctor view).
 * doctorName is null for the Patient Audit Log; for the Doctor Audit Log
 * it's the patient's most recently-treating consultant (resolved via their
 * latest Appointment) - there's no per-upload doctor concept in this
 * schema, so this is the closest real, non-fabricated link available.
 */
public record PatientReportAuditLogRowDto(
        Long id,
        String operation,
        String patientUhid,
        String patientName,
        String doctorName,
        String filePath,
        String originalFileName,
        String fileType,
        LocalDateTime dateTime,
        String createdBy) {
}
