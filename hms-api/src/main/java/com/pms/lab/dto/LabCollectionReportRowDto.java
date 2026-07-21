package com.pms.lab.dto;

import java.time.LocalDateTime;

public record LabCollectionReportRowDto(
        Long requisitionId,
        String patientName,
        String patientUhid,
        String typeLabel,
        LocalDateTime billedAt,
        String paymentMode,
        String consultantName,
        String billedBy,
        Long invoiceNumber,
        double invoiceAmount,
        double doctorReferralAmount,
        double discountAmount,
        double receiptAmount,
        double refundAmount) {
}
