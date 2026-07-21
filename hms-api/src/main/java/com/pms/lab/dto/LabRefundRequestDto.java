package com.pms.lab.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record LabRefundRequestDto(@NotNull Long requisitionId, @NotNull @Positive Double refundAmount, String reason) {
}
