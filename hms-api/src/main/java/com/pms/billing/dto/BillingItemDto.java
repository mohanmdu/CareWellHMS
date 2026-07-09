package com.pms.billing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record BillingItemDto(
        Long id,
        @NotBlank String name,
        @NotNull Long categoryId,
        String categoryName,
        @PositiveOrZero Double price,
        Boolean active) {
}
