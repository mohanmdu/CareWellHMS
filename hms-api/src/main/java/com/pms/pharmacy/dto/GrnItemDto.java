package com.pms.pharmacy.dto;

import java.time.LocalDate;

public record GrnItemDto(
        Long id,
        Long productId,
        String productName,
        String productTypeName,
        Integer packing,
        Integer qty,
        Integer totalQty,
        Integer freeQty,
        String batch,
        LocalDate expiryDate,
        LocalDate manufactureDate,
        Double mrp,
        Double purchaseRate,
        Double discountPercent,
        Double discountAmount,
        String hsnSac,
        Double sgstPercent,
        Double sgstAmount,
        Double cgstPercent,
        Double cgstAmount,
        Double netValue) {
}
