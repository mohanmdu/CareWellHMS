package com.pms.ipadmission.dto;

import com.pms.ipadmission.entity.RoomStatus;
import jakarta.validation.constraints.NotNull;

public record RoomStatusUpdateRequest(@NotNull RoomStatus status) {
}
