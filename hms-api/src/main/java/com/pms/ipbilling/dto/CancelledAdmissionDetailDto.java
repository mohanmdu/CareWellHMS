package com.pms.ipbilling.dto;

import java.time.Instant;
import java.time.LocalDateTime;

/** Full "Cancelled Admission Information" view (PDF: View Details drill-down). */
public record CancelledAdmissionDetailDto(
        Long admissionId,
        String admissionNumber,
        String patientUhid,
        String patientName,
        String patientGender,
        Integer patientAge,
        String patientMobileNumber,
        String patientAddress,
        LocalDateTime admissionDate,
        LocalDateTime cancelledAt,
        String wardType,
        String bedNumber,
        String primaryConsultant,
        String referralDoctor,
        String paymentType,
        String admissionStatus,
        String cancellationReason,
        String cancelledBy,
        String remarks,
        Instant createdAt,
        String createdBy,
        double admissionCharges,
        double advanceAmount,
        double refundAmount,
        double balanceAmount,
        String refundStatus) {
}
