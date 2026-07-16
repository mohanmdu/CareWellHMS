package com.pms.pharmacy.dto;

import java.time.Instant;

public record PharmacyStatementEntryDto(
        Long billNumber,
        String registrationNumber,
        String patientType,
        String patientName,
        Instant date,
        String createdBy,
        Double amount) {
}
