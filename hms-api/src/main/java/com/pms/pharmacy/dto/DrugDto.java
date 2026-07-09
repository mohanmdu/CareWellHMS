package com.pms.pharmacy.dto;

import jakarta.validation.constraints.NotBlank;

public record DrugDto(
        Long id, @NotBlank String name, String genericName, String manufacturer, String unitOfMeasure, Boolean active) {
}
