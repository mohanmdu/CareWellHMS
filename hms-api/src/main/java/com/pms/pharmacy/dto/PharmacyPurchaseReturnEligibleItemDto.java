package com.pms.pharmacy.dto;

public record PharmacyPurchaseReturnEligibleItemDto(
        Long stockId,
        String invoiceNo,
        String productName,
        String productTypeName,
        String batch,
        Integer purchaseQty,
        Integer quantityOnHand,
        Double productPrice,
        Double mrp) {
}
