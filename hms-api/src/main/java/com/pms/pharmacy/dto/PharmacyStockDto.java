package com.pms.pharmacy.dto;

import java.time.LocalDate;

/** Available-batch row shown in Pharmacy Billing's item-entry autocomplete. */
public record PharmacyStockDto(
        Long id,
        Long productId,
        String productName,
        String productTypeName,
        String batch,
        LocalDate expiryDate,
        LocalDate manufactureDate,
        Double mrp,
        Double purchaseRate,
        int quantityOnHand,
        Integer packing) {
}
