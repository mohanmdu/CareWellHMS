package com.pms.pharmacy.dto;

import java.time.Instant;

public record PharmacyReturnListEntryDto(
        Long id, Long saleId, Long billNumber, String productName, Integer quantity, Double amount, String remarks, String returnedBy, Instant returnedAt) {
}
