package com.pms.pharmacy.dto;

public record ItemWiseDetailEntryDto(
        Long grnId,
        String invoiceNo,
        String drugName,
        String drugType,
        String batch,
        Integer qty,
        Double productPrice,
        Double mrp,
        Double netAmountInclGst,
        String supplierName,
        String manufacturerName) {
}
