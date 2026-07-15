package com.pms.pharmacy.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record ApprovePurchaseOrderRequest(@NotEmpty List<@Valid PurchaseOrderItemApproval> items) {

    public record PurchaseOrderItemApproval(Long itemId, Integer orderQty) {
    }
}
