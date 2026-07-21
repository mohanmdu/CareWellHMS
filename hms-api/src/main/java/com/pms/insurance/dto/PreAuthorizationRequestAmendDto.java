package com.pms.insurance.dto;

import jakarta.validation.constraints.PositiveOrZero;

/** "Change the Amount" (Insurance Claim Report): corrects an already-decided request's figures. */
public record PreAuthorizationRequestAmendDto(
        @PositiveOrZero double requestedAmount, @PositiveOrZero double approvedAmount, String cardNumber, String claimNumber) {
}
