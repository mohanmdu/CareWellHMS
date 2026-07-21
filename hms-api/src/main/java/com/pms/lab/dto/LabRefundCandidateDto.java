package com.pms.lab.dto;

import java.time.LocalDateTime;

/**
 * Result of searching a billed LabRequisition by Invoice No. When
 * alreadyRefunded is true, refundNumber/refundAmount/refundedAt carry the
 * existing refund - a refund can only happen once per invoice.
 */
public record LabRefundCandidateDto(
        Long requisitionId,
        String patientName,
        String patientUhid,
        Long invoiceNumber,
        double invoiceAmount,
        Double paidAmount,
        String createdBy,
        boolean alreadyRefunded,
        Long refundNumber,
        Double refundAmount,
        LocalDateTime refundedAt) {
}
