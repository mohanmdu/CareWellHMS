package com.pms.pharmacy.dto;

import com.pms.pharmacy.entity.PharmacyPurchaseReturnType;
import java.time.Instant;

public record PharmacyPurchaseReturnSummaryDto(
        Long id, PharmacyPurchaseReturnType returnType, String remarks, Double totalAmount, String returnedBy, Instant createdAt) {
}
