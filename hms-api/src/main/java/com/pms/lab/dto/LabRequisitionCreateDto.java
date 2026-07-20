package com.pms.lab.dto;

import com.pms.lab.entity.LabBillingType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record LabRequisitionCreateDto(
        @NotNull Long patientId,
        Long consultantId,
        @NotNull LabBillingType billingType,
        @NotEmpty List<Long> subCategoryIds) {
}
