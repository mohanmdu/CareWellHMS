package com.pms.pharmacy.dto;

import java.time.Instant;

public record ItemWiseSalesDetailDto(
        Long saleId, Long invoiceNo, String batch, Double vatPercent, String registrationNumber, String patientName, Integer saleQty, Instant sellingDate) {
}
