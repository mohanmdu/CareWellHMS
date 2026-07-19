package com.pms.ipbilling.dto;

import java.time.Instant;

public record IpPaymentDto(
        Long id,
        Long admissionId,
        Instant paymentDate,
        String receiptNumber,
        String description,
        String paymentType,
        Double invoicedAmount,
        Double refundAmount,
        Double netAmount,
        String createdBy) {
}
