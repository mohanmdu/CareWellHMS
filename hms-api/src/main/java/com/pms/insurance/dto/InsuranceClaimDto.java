package com.pms.insurance.dto;

import com.pms.insurance.entity.InsuranceClaimStatus;
import com.pms.insurance.entity.InsuranceClaimType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record InsuranceClaimDto(
        Long id,
        String claimNumber,
        @NotNull Long patientId,
        String patientName,
        @NotBlank String policyNumber,
        @NotBlank String insurerName,
        @NotNull InsuranceClaimType claimType,
        @PositiveOrZero double requestedAmount,
        Double approvedAmount,
        InsuranceClaimStatus status,
        String decisionReason) {
}
