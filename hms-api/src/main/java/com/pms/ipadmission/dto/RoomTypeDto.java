package com.pms.ipadmission.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public record RoomTypeDto(Long id, @NotBlank String name, @PositiveOrZero Double dailyRate, Boolean active) {
}
