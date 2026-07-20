package com.pms.lab.dto;

import com.pms.lab.entity.LabBillingType;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record LabRequisitionCreateDto(
        @NotNull Long patientId,
        Long consultantId,
        @NotNull LabBillingType billingType,
        List<Long> subCategoryIds,
        List<LabRequisitionAdHocItemDto> adHocItems) {
}
