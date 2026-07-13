package com.pms.registration.dto;

import com.pms.registration.entity.RefundSource;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RefundRequest(
        @NotNull Long sourceId,
        @NotNull RefundSource source,
        @NotNull @Positive Double refundAmount,
        String reason) {
}
