package com.pms.ipadmission.dto;

import com.pms.ipadmission.entity.AdmissionStatus;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record AdmissionDto(
        Long id,
        String admissionNumber,
        @NotNull Long patientId,
        String patientName,
        @NotNull Long roomId,
        String roomNumber,
        String roomTypeName,
        LocalDateTime admissionDate,
        AdmissionStatus status,
        Double advanceAmount,
        Double totalBilled,
        Double settlementAmount,
        LocalDateTime dischargeDate,
        String dischargeSummary) {
}
