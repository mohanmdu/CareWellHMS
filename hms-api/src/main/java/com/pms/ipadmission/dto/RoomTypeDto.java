package com.pms.ipadmission.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.Instant;

public record RoomTypeDto(
        Long id,
        @NotBlank String name,
        @PositiveOrZero Double rentCash,
        @PositiveOrZero Double rentClaim,
        Boolean active,
        Long roomCount,
        Instant createdAt,
        String createdBy,
        Instant updatedAt,
        String updatedBy,
        Instant deactivatedAt,
        String deactivatedBy) {
}
