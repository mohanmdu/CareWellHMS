package com.pms.pharmacy.dto;

import jakarta.validation.constraints.NotNull;

public record PharmacyStockUpdateMrpRequest(@NotNull Double mrp) {
}
