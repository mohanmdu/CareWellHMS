package com.pms.pharmacy.dto;

import jakarta.validation.constraints.NotNull;

public record SupplierPaymentRequest(@NotNull Double amount, @NotNull String payMode, String transactionId, String remarks) {
}
