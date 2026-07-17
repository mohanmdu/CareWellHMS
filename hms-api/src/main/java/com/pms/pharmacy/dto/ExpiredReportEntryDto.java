package com.pms.pharmacy.dto;

import java.time.LocalDate;

public record ExpiredReportEntryDto(
        String productName,
        String manufacturerName,
        String supplierName,
        String batch,
        Integer quantity,
        Double purchasePrice,
        Double mrp,
        Double totalAmountSp,
        Double totalAmountPp,
        LocalDate expiryDate) {
}
