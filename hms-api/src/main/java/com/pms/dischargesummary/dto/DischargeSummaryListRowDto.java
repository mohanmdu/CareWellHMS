package com.pms.dischargesummary.dto;

import java.time.LocalDateTime;

/** One row of the Discharge Summary list - clinical-documentation columns only, no billing breakdown (see DischargeListRowDto for that). */
public record DischargeSummaryListRowDto(
        Long admissionId,
        String admissionNumber,
        String patientUhid,
        String patientName,
        String patientGender,
        String insuranceType,
        LocalDateTime admissionDate,
        LocalDateTime dischargeDate,
        String surgery,
        Long dischargeSummaryId) {
}
