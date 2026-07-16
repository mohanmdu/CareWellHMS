package com.pms.pharmacy.dto;

import com.pms.pharmacy.entity.PharmacyPurchaseReturnType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record PharmacyPurchaseReturnRequest(
        @NotNull Long supplierId,
        @NotNull PharmacyPurchaseReturnType returnType,
        String remarks,
        @NotEmpty List<@Valid PharmacyPurchaseReturnItemRequest> items) {
}
