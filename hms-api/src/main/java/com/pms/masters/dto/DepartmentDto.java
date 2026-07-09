package com.pms.masters.dto;

import jakarta.validation.constraints.NotBlank;

public record DepartmentDto(Long id, @NotBlank String name, Boolean active) {
}
