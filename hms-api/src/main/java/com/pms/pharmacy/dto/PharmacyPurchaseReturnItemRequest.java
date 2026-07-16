package com.pms.pharmacy.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PharmacyPurchaseReturnItemRequest(@NotNull Long stockId, @Positive Integer quantity) {
}
