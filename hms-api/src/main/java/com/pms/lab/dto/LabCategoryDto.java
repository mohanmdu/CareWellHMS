package com.pms.lab.dto;

import jakarta.validation.constraints.NotBlank;

public record LabCategoryDto(
        Long id,
        @NotBlank String name,
        Double opAmount,
        Double ipAmount,
        Integer orderingNo,
        Long subCategoryCount,
        Long componentCount) {
}
