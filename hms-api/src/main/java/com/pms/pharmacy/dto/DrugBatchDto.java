package com.pms.pharmacy.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

public record DrugBatchDto(
        Long id,
        @NotNull Long drugId,
        String drugName,
        @NotNull String batchNumber,
        @NotNull LocalDate expiryDate,
        @Min(0) Integer quantityOnHand,
        @PositiveOrZero Double purchasePrice,
        @PositiveOrZero Double sellingPrice) {
}
