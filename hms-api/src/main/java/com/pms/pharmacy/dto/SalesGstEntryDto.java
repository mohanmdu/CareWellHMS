package com.pms.pharmacy.dto;

public record SalesGstEntryDto(
        Long saleId,
        Long invoiceNo,
        String patientName,
        String drugDetails,
        Double sgstPercent,
        Double sgstAmount,
        Double cgstPercent,
        Double cgstAmount,
        Double mrp,
        Double netAmount) {
}
