package com.pms.labradiology.dto;

import com.pms.labradiology.entity.RequisitionStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record LabRequisitionDto(
        Long id,
        String requisitionNumber,
        @NotNull Long patientId,
        String patientName,
        Long appointmentId,
        RequisitionStatus status,
        String notes,
        @NotEmpty @Valid List<LabRequisitionItemDto> items) {
}
