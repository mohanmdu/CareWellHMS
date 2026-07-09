package com.pms.billing.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InvoiceLineItemDto(
        Long id, @NotNull Long billingItemId, String itemName, @Min(1) Integer quantity, Double unitPrice, Double lineTotal) {
}
