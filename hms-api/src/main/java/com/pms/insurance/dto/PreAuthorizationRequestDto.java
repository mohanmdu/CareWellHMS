package com.pms.insurance.dto;

import com.pms.insurance.entity.PreAuthorizationStatus;
import java.time.LocalDateTime;

public record PreAuthorizationRequestDto(
        Long id,
        String requestNumber,
        Long patientId,
        String patientName,
        String patientUhid,
        String patientGender,
        Integer patientAge,
        String maritalStatus,
        Long admissionId,
        String admissionNumber,
        LocalDateTime admissionDate,
        String paymentType,
        String roomNumber,
        String attenderName,
        String relationType,
        String relationMobileNo,
        String referralDoctor,
        String primaryConsultant,
        String policyNumber,
        String cardNumber,
        String claimNumber,
        String insurerName,
        String tpaName,
        String corporateName,
        double requestedAmount,
        Double approvedAmount,
        PreAuthorizationStatus status,
        String decisionReason,
        LocalDateTime raisedAt,
        String raisedBy,
        LocalDateTime decidedAt,
        String approvedBy) {
}
