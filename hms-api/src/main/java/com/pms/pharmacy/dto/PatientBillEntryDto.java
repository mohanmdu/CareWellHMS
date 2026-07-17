package com.pms.pharmacy.dto;

import java.time.Instant;

public record PatientBillEntryDto(
        Long saleId,
        Long billNumber,
        String registrationNumber,
        String patientName,
        String type,
        Instant invoiceDate,
        Double invoicedAmount,
        Instant paidDate,
        Double dueAmount) {
}
