package com.pms.masters.dto;

import jakarta.validation.constraints.NotBlank;

public record RoleDto(Long id, @NotBlank String name, Boolean active) {
}
