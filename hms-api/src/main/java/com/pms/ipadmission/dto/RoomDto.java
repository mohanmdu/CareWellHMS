package com.pms.ipadmission.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RoomDto(Long id, @NotBlank String roomNumber, @NotNull Long roomTypeId, String roomTypeName, Boolean occupied) {
}
