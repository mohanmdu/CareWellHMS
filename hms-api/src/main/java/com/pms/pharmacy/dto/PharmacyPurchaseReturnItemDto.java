package com.pms.pharmacy.dto;

public record PharmacyPurchaseReturnItemDto(
        Long id, Long stockId, String productName, String batch, Double mrp, Double purchaseRate, Integer quantity, Double netAmount) {
}
