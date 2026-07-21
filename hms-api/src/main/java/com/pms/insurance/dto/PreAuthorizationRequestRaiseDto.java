package com.pms.insurance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Confirms the real policy/card/estimated-amount for a request auto-seeded
 * as YET_TO_BE_RAISED, and actually submits it (-> PENDING). No insurerName
 * field here - the insurer is already known (set at seed time from the
 * Admission's Insurance Company, or already collected for a manually
 * create()'d request), matching the reference's inline raise panel which
 * only asks for Estimated Amount / Policy No / Card No.
 */
public record PreAuthorizationRequestRaiseDto(
        @NotBlank String policyNumber, String cardNumber, @PositiveOrZero double requestedAmount) {
}
