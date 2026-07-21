package com.pms.insurance.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

public record PreAuthorizationRequestApproveDto(
        @NotNull @PositiveOrZero Double approvedAmount, String reason, @NotNull LocalDate decidedDate) {
}
