package com.pms.cashier.dto;

import java.time.Instant;

/** One approved cashier request eligible for Cancel / Convert to Credit (PDF: "Cancellation/Refund Requests"). */
public record CancellationRequestRowDto(
        Long id,
        String patientUhid,
        String patientName,
        String admissionNumber,
        double amount,
        String paymentMode,
        Instant invoiceDate,
        String type,
        String paymentStatus,
        String invoiceId) {
}
