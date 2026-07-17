package com.pms.pharmacy.dto;

import java.time.LocalDate;

public record InventoryReportEntryDto(
        Long productId,
        String productName,
        String batch,
        Integer packing,
        Integer noPack,
        Integer quantity,
        Double sellingPrice,
        Double netAmountSp,
        Double purchasePrice,
        Double netAmountPp,
        LocalDate expiryDate) {
}
