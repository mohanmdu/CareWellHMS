package com.pms.registration.dto;

import java.time.LocalDate;

public record ReviewDateReportEntryDto(
        Long appointmentId,
        String patientName,
        String patientRegistrationNumber,
        Integer age,
        String gender,
        String mobileNumber,
        LocalDate appointmentDate,
        String consultantName,
        LocalDate reviewDate) {
}
