package com.pms.ipbilling.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.Instant;

public record IpBillingLineItemDto(
        Long id,
        Long admissionId,
        @NotNull Long categoryId,
        String categoryName,
        Long consultantId,
        String consultantName,
        @NotNull Long componentId,
        String componentName,
        String remarks,
        @Positive Integer quantity,
        Double unitAmount,
        String units,
        Double lineTotal,
        Double discountAmount,
        Double refundAmount,
        String discountReason,
        Instant requestedOn,
        String createdBy) {
}
