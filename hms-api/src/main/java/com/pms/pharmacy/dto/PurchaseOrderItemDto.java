package com.pms.pharmacy.dto;

public record PurchaseOrderItemDto(
        Long id,
        Long productId,
        String productName,
        String productTypeName,
        Integer packing,
        Integer qty,
        Integer totalQty,
        Integer orderQty) {
}
