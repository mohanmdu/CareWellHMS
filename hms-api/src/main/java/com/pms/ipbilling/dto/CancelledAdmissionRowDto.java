package com.pms.ipbilling.dto;

import java.time.Instant;
import java.time.LocalDateTime;

/** One row of the Cancelled Admissions audit screen (PDF). */
public record CancelledAdmissionRowDto(
        Long admissionId,
        String patientUhid,
        String patientName,
        String admissionNumber,
        String caseDescription,
        String paymentType,
        String primaryConsultant,
        String referralDoctor,
        String wardType,
        Instant createdAt,
        String createdBy,
        LocalDateTime cancelledAt,
        String cancelledBy,
        String cancellationReason,
        String refundStatus) {
}
