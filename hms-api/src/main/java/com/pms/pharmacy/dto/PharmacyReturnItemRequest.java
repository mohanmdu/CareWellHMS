package com.pms.pharmacy.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PharmacyReturnItemRequest(@NotNull Long saleItemId, @Positive Integer quantity) {
}
