package com.pms.registration.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record OpCaseSheetHeaderDto(
        Long appointmentId,
        String patientRegistrationNumber,
        String patientName,
        String gender,
        Integer age,
        String mobileNumber,
        LocalDate appointmentDate,
        LocalTime slotTime,
        String consultantName) {
}
