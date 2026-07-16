package com.pms.pharmacy.dto;

import java.time.Instant;
import java.time.LocalDate;

public record DiReportEntryDto(
        Long saleId,
        Long billNumber,
        Instant date,
        String registrationNumber,
        String patientName,
        String drName,
        String manufacturerName,
        String productName,
        Integer qtyIssued,
        Double mrp,
        String batchNo,
        LocalDate expiryDate,
        String pharmacistSign) {
}
