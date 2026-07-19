package com.pms.icd.dto;

import com.pms.icd.entity.DiagnosisSeverity;
import com.pms.icd.entity.DiagnosisStatus;
import com.pms.icd.entity.DiagnosisType;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.LocalDate;

public record PatientDiagnosisDto(
        Long id,
        Long patientId,
        String patientUhid,
        String patientName,
        @NotNull Long icdCodeId,
        String icdCode,
        String diseaseName,
        String icdVersion,
        @NotNull DiagnosisType diagnosisType,
        Long departmentId,
        String departmentName,
        Long consultantId,
        String consultantName,
        @NotNull LocalDate diagnosisDate,
        @NotNull DiagnosisStatus status,
        DiagnosisSeverity severity,
        String comments,
        String clinicalNotes,
        String addedBy,
        Instant createdAt,
        Instant updatedAt) {
}
