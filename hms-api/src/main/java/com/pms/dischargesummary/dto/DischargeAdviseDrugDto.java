package com.pms.dischargesummary.dto;

import com.pms.dischargesummary.entity.AdviseType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DischargeAdviseDrugDto(
        Long id,
        @NotBlank String drugName,
        @NotNull AdviseType adviseType,
        String dose,
        String morning,
        String afternoon,
        String evening,
        String night,
        String route,
        String relationshipWithMeal,
        String duration) {
}
