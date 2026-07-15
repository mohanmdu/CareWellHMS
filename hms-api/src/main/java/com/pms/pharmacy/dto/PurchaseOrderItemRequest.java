package com.pms.pharmacy.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PurchaseOrderItemRequest(
        @NotNull Long productId, @Positive Integer packing, @Positive Integer qty, @Positive Integer totalQty) {
}
