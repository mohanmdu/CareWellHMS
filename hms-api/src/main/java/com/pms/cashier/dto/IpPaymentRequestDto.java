package com.pms.cashier.dto;

import com.pms.cashier.entity.PaymentRequestStatus;
import com.pms.cashier.entity.PaymentRequestType;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record IpPaymentRequestDto(
        Long id,
        @NotNull Long admissionId,
        String admissionNumber,
        String patientUhid,
        String patientName,
        String patientGender,
        Integer patientAge,
        Double heightCm,
        Double weightKg,
        String patientAddress,
        String primaryConsultant,
        @NotNull PaymentRequestType requestType,
        @NotNull Double amount,
        String description,
        PaymentRequestStatus status,
        String paymentMode,
        Instant requestedAt,
        String requestedBy,
        Instant approvedAt,
        String approvedBy,
        Long ipPaymentId,
        String receiptNumber) {
}
