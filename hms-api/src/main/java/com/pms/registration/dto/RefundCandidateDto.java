package com.pms.registration.dto;

import com.pms.registration.entity.RefundSource;
import java.time.Instant;

/**
 * Result of searching a billed invoice by Invoice No (Payment Refund's
 * search step) - sourceId/source identify which billing entity matched
 * (Appointment or OP Direct Billing, both share one invoice-number
 * sequence, so at most one ever matches). When {@code alreadyRefunded} is
 * true, the trailing three fields carry the existing refund so the frontend
 * can show it instead of an entry form - a refund can only happen once per invoice.
 */
public record RefundCandidateDto(
        Long sourceId,
        RefundSource source,
        String patientName,
        String patientRegistrationNumber,
        String consultantName,
        Long invoiceNumber,
        Double invoicedAmount,
        Double paidAmount,
        String billedBy,
        Instant billedAt,
        boolean alreadyRefunded,
        Long refundNumber,
        Double refundAmount,
        Instant refundedAt) {
}
