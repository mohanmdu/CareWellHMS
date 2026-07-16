package com.pms.pharmacy.dto;

public record StockBalanceEntryDto(
        Long productId,
        String productName,
        int openingStock,
        int saleQty,
        int returnQty,
        int internReceiptQty,
        int stockAdjustmentQty,
        int closingStock) {
}
