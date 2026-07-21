package com.pms.registration.dto;

import java.time.LocalDateTime;

public record PatientReportDto(
        Long id,
        Long patientId,
        String patientName,
        String patientRegistrationNumber,
        String patientMobileNumber,
        String comments,
        String filePath,
        String originalFileName,
        String fileType,
        String uploadedBy,
        LocalDateTime uploadedAt,
        LocalDateTime deletedAt,
        String deletedBy,
        String deleteReason) {
}
