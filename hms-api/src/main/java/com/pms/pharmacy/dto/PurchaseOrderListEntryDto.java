package com.pms.pharmacy.dto;

import com.pms.pharmacy.entity.PurchaseOrderStatus;
import java.time.Instant;

public record PurchaseOrderListEntryDto(
        Long id, Long poNumber, String supplierName, PurchaseOrderStatus status, Instant createdAt, String createdBy) {
}
