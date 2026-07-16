package com.pms.pharmacy.dto;

import com.pms.pharmacy.entity.PharmacyPurchaseReturnType;
import java.time.Instant;
import java.util.List;

public record PharmacyPurchaseReturnDto(
        Long id,
        Long supplierId,
        String supplierName,
        String supplierAddress,
        String supplierMobileNumber,
        PharmacyPurchaseReturnType returnType,
        String remarks,
        List<PharmacyPurchaseReturnItemDto> items,
        Double totalAmount,
        String returnedBy,
        Instant createdAt) {
}
