package com.pms.pharmacy.dto;

import com.pms.pharmacy.entity.PharmacyStockTransactionType;
import jakarta.validation.constraints.NotNull;

public record PharmacyStockTransactionRequest(
        @NotNull Long stockId,
        @NotNull PharmacyStockTransactionType transactionType,
        @NotNull Integer quantity,
        @NotNull Long locationId,
        String reason) {
}
