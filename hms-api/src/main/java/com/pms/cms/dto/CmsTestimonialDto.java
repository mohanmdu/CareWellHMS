package com.pms.cms.dto;

import jakarta.validation.constraints.NotBlank;

public record CmsTestimonialDto(
        Long id, @NotBlank String patientName, @NotBlank String quote, Integer rating, String photoPath, Boolean active) {
}
