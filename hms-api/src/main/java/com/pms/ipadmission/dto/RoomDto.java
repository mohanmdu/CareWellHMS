package com.pms.ipadmission.dto;

import com.pms.ipadmission.entity.RoomStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record RoomDto(
        Long id,
        @NotBlank String roomNumber,
        String bedNumber,
        @NotNull Long roomTypeId,
        String roomTypeName,
        Double rentCash,
        RoomStatus status,
        Boolean active,
        Instant createdAt,
        String createdBy,
        Instant updatedAt,
        String updatedBy,
        Instant deactivatedAt,
        String deactivatedBy) {
}
