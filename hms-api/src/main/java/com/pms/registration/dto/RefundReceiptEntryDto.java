package com.pms.registration.dto;

import com.pms.registration.entity.RefundSource;
import java.time.Instant;

/**
 * One shape reused for both the receipt shown immediately after confirming
 * a refund and every row of the Refund Report - the report's already-loaded
 * row data is therefore enough to reprint a receipt with no extra API call
 * (same trick used for the Collection Report -> Payment Receipt). type is a
 * human label ("Consultation"/"Direct Billing"); source is the same
 * distinction as a machine-readable enum for any future routing needs.
 */
public record RefundReceiptEntryDto(
        Long sourceId,
        RefundSource source,
        Long refundNumber,
        String patientName,
        String patientRegistrationNumber,
        String consultantName,
        String type,
        Long invoiceNumber,
        Double invoicedAmount,
        Double paidAmount,
        Double refundAmount,
        String reason,
        Instant billedAt,
        Instant refundedAt,
        String refundedBy) {
}
