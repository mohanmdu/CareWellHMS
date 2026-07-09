package com.pms.labradiology.dto;

import com.pms.labradiology.entity.RequisitionItemStatus;
import jakarta.validation.constraints.NotNull;

public record LabRequisitionItemDto(
        Long id,
        @NotNull Long billingItemId,
        String testName,
        String specimenType,
        RequisitionItemStatus status,
        String resultValue,
        String normalRange) {
}
