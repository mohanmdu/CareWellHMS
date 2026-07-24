package com.pms.lab.dto;

import com.pms.masters.entity.RevenueBucket;
import jakarta.validation.constraints.NotBlank;

public record LabCategoryDto(
        Long id,
        @NotBlank String name,
        Double opAmount,
        Double ipAmount,
        Integer orderingNo,
        RevenueBucket revenueBucket,
        Long subCategoryCount,
        Long componentCount) {
}
