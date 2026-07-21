package com.pms.lab.dto;

import java.time.LocalDateTime;

/**
 * One shape reused for both the receipt shown immediately after confirming
 * a refund and every row of the Refund Report - a report row already has
 * every field the receipt needs, so clicking into it needs no extra API
 * call (mirrors com.pms.registration.dto.RefundReceiptEntryDto).
 */
public record LabRefundReceiptEntryDto(
        Long id,
        Long requisitionId,
        Long refundNumber,
        String patientName,
        String patientUhid,
        String gender,
        Integer age,
        String patientType,
        String requisitionType,
        Long invoiceNumber,
        double invoiceAmount,
        Double paidAmount,
        Double refundAmount,
        String reason,
        LocalDateTime billedAt,
        LocalDateTime refundedAt,
        String refundedBy) {
}
