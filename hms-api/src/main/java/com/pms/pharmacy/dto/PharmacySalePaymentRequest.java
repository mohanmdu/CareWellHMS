package com.pms.pharmacy.dto;

import jakarta.validation.constraints.NotNull;

public record PharmacySalePaymentRequest(
        @NotNull Double amount, Double discountAmount, String remarks, @NotNull String payMode) {
}
