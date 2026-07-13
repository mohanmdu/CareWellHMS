package com.pms.masters.dto;

import jakarta.validation.constraints.NotBlank;

public record SpecializationDto(Long id, @NotBlank String name, Boolean active) {
}
