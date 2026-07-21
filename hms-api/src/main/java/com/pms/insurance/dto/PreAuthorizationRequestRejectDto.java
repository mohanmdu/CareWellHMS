package com.pms.insurance.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record PreAuthorizationRequestRejectDto(String reason, @NotNull LocalDate decidedDate) {
}
