package com.pms.pharmacy.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record PharmacySaleItemDto(
        Long id, @NotNull Long batchId, String drugName, @Min(1) Integer quantity, Double unitPrice, Double lineTotal) {
}
