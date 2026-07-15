package com.pms.pharmacy.dto;

import java.time.LocalDate;

public record PharmacySaleItemDto(
        Long id,
        Long stockId,
        String productName,
        String productTypeName,
        String batch,
        LocalDate expiryDate,
        Double mrp,
        Integer quantity,
        Double amount,
        String hsnSac,
        Double sgstPercent,
        Double sgstAmount,
        Double cgstPercent,
        Double cgstAmount,
        Double netAmount) {
}
