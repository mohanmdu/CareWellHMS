package com.pms.icd.dto;

import java.time.LocalDate;

public record PatientVisitSummaryDto(
        Long patientId,
        String uhid,
        String patientName,
        String gender,
        Integer age,
        String mobileNumber,
        String department,
        String consultant,
        String patientType,
        String visitNumber,
        LocalDate lastVisitDate) {
}
