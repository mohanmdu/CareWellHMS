package com.pms.cms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public record CmsHealthPackageDto(
        Long id, @NotBlank String name, String description, @PositiveOrZero Double price, String includes, Boolean active) {
}
