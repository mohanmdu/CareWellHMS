package com.pms.lab.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LabComponentDto(
        Long id,
        @NotNull Long subCategoryId,
        String subCategoryName,
        Long categoryId,
        String categoryName,
        @NotBlank String name,
        String fieldType,
        String sampleType,
        String method,
        String maleRangeFrom,
        String maleRangeTo,
        String femaleRangeFrom,
        String femaleRangeTo,
        String normalRange,
        String units,
        Integer orderingNo,
        String componentHeading,
        String conventionalFactor,
        String siUnit) {
}
