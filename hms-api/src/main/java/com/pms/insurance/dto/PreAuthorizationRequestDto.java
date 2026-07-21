package com.pms.insurance.dto;

import com.pms.insurance.entity.PreAuthorizationStatus;
import java.time.LocalDateTime;

public record PreAuthorizationRequestDto(
        Long id,
        String requestNumber,
        Long patientId,
        String patientName,
        String patientUhid,
        Long admissionId,
        String admissionNumber,
        String policyNumber,
        String insurerName,
        String tpaName,
        String corporateName,
        double requestedAmount,
        Double approvedAmount,
        PreAuthorizationStatus status,
        String decisionReason,
        LocalDateTime raisedAt,
        String raisedBy) {
}
