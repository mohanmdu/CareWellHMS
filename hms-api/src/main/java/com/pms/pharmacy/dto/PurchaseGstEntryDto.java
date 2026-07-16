package com.pms.pharmacy.dto;

public record PurchaseGstEntryDto(
        Long grnId,
        String invoiceNo,
        String drugDetails,
        Double purchaseAmount,
        Double sgstPercent,
        Double sgstAmount,
        Double cgstPercent,
        Double cgstAmount,
        Double netAmount) {
}
