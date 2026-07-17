package com.pms.pharmacy.dto;

public record ProductMovementEntryDto(Long productId, String productName, Integer purchaseQty, Integer salesQty, Integer returnQty, Integer netQty) {
}
