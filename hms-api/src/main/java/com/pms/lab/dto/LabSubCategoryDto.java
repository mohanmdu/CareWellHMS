package com.pms.lab.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LabSubCategoryDto(
        Long id,
        @NotNull Long categoryId,
        String categoryName,
        @NotBlank String name,
        Double opAmount,
        Double ipAmount,
        String notes,
        Integer orderingNo,
        String heading,
        Long componentCount) {
}
