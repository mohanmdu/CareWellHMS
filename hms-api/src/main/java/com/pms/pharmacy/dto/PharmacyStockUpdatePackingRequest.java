package com.pms.pharmacy.dto;

import jakarta.validation.constraints.NotNull;

public record PharmacyStockUpdatePackingRequest(@NotNull Integer quantityOnHand, @NotNull Integer packing) {
}
