package com.pms.insurance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/** Raising a Pre Authorization Request directly (not via an Admission) - status is PENDING immediately, no admission link. */
public record PreAuthorizationRequestCreateDto(
        @NotNull Long patientId,
        @NotBlank String policyNumber,
        String cardNumber,
        @NotBlank String insurerName,
        String tpaName,
        String corporateName,
        @PositiveOrZero double requestedAmount) {
}
