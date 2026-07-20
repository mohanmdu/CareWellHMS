package com.pms.lab.dto;

import com.pms.lab.entity.LabPaymentMode;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record LabRequisitionApproveDto(
        @NotNull @PositiveOrZero Double paidAmount,
        @PositiveOrZero Double discountAmount,
        @NotNull LabPaymentMode paymentMode,
        String remarks) {
}
