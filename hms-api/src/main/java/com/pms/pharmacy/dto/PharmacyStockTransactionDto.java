package com.pms.pharmacy.dto;

import com.pms.pharmacy.entity.PharmacyStockTransactionType;
import java.time.Instant;

public record PharmacyStockTransactionDto(
        Long id,
        Long stockId,
        String productName,
        String batch,
        PharmacyStockTransactionType transactionType,
        Integer quantity,
        Long locationId,
        String locationName,
        String reason,
        String updatedBy,
        Instant updatedAt) {
}
