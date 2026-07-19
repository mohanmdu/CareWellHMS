package com.pms.cms.dto;

import jakarta.validation.constraints.NotBlank;

public record CmsFaqDto(Long id, @NotBlank String question, @NotBlank String answer, Integer sortOrder, Boolean active) {
}
