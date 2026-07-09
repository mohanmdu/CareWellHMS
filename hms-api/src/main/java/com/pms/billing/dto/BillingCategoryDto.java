package com.pms.billing.dto;

import jakarta.validation.constraints.NotBlank;

public record BillingCategoryDto(Long id, @NotBlank String name, Boolean active) {
}
