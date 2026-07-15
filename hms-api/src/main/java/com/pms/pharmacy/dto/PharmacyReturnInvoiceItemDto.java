package com.pms.pharmacy.dto;

import java.time.LocalDate;

public record PharmacyReturnInvoiceItemDto(
        Long saleItemId,
        String productName,
        String productTypeName,
        String batch,
        LocalDate expiryDate,
        String manufacturerName,
        Integer quantitySold,
        Integer remainingQty,
        Double mrp,
        Double sgstPercent,
        Double cgstPercent,
        Double netAmount) {
}
