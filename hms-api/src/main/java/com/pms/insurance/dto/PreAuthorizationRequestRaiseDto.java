package com.pms.insurance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

/** Confirms the real policy/insurer/amount for a request auto-seeded as YET_TO_BE_RAISED, and actually submits it (-> PENDING). */
public record PreAuthorizationRequestRaiseDto(
        @NotBlank String policyNumber, @NotBlank String insurerName, @PositiveOrZero double requestedAmount) {
}
