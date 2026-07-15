package com.pms.pharmacy.dto;

import com.pms.pharmacy.entity.PharmacyReturnType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record PharmacyReturnRequest(
        @NotNull Long saleId,
        @NotNull PharmacyReturnType returnType,
        String remarks,
        @NotEmpty List<@Valid PharmacyReturnItemRequest> items) {
}
