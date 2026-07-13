package com.pms.registration.dto;

import com.pms.registration.entity.PaymentMode;
import java.time.Instant;

public record CollectionReportEntryDto(
        String source,
        Long appointmentId,
        Long directBillingId,
        Long invoiceNumber,
        String patientName,
        String patientRegistrationNumber,
        Instant billedAt,
        PaymentMode paymentMode,
        String consultantName,
        String billedBy,
        Double invoicedAmount,
        Double doctorReferralAmount,
        Double paidAmount,
        Double refundAmount) {
}
