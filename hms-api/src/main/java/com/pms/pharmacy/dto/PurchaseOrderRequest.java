package com.pms.pharmacy.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record PurchaseOrderRequest(
        @NotNull Long supplierId, @NotEmpty List<@Valid PurchaseOrderItemRequest> items, String comments) {
}
