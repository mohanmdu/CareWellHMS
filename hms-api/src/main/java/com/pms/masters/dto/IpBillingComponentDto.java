package com.pms.masters.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record IpBillingComponentDto(
        Long id,
        @NotNull Long categoryId,
        String categoryName,
        @NotBlank String name,
        @NotNull @PositiveOrZero Double ipAmount,
        @NotNull @PositiveOrZero Double insuranceAmount,
        Boolean active) {
}
