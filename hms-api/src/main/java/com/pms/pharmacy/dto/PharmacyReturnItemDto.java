package com.pms.pharmacy.dto;

public record PharmacyReturnItemDto(
        Long id,
        Long saleItemId,
        String productName,
        String batch,
        Double mrp,
        Integer quantity,
        Double amount,
        Double sgstPercent,
        Double sgstAmount,
        Double cgstPercent,
        Double cgstAmount,
        Double netAmount) {
}
