package com.pms.pharmacy.dto;

import com.pms.pharmacy.entity.PurchaseOrderStatus;
import java.time.Instant;
import java.util.List;

public record PurchaseOrderDto(
        Long id,
        Long poNumber,
        Long supplierId,
        String supplierName,
        String supplierContactPersonName,
        String supplierAddress,
        String supplierMobileNumber,
        PurchaseOrderStatus status,
        List<PurchaseOrderItemDto> items,
        String comments,
        String createdBy,
        Instant createdAt,
        String approvedBy,
        Instant approvedAt) {
}
