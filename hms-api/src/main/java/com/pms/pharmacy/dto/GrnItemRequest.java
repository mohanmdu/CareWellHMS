package com.pms.pharmacy.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public record GrnItemRequest(
        @NotNull Long productId,
        @Positive Integer packing,
        @Positive Integer qty,
        @Positive Integer totalQty,
        Integer freeQty,
        String batch,
        LocalDate expiryDate,
        LocalDate manufactureDate,
        Double mrp,
        @NotNull Double purchaseRate,
        Double discountPercent,
        Double discountAmount,
        String hsnSac,
        Double sgstPercent,
        Double cgstPercent) {
}
