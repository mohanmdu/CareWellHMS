package com.pms.pharmacy.dto;

import java.util.List;

public record PatientStatementDto(
        String registrationNumber,
        String patientName,
        String gender,
        List<PatientStatementItemDto> medicalItems,
        List<PatientStatementItemDto> nonMedicalItems,
        Double paidAmount,
        Double discountAmount,
        Double dueAmount) {
}
