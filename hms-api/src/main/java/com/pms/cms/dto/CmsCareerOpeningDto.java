package com.pms.cms.dto;

import jakarta.validation.constraints.NotBlank;

public record CmsCareerOpeningDto(
        Long id, @NotBlank String title, Long departmentId, String departmentName, String description, String applyEmail, Boolean active) {
}
