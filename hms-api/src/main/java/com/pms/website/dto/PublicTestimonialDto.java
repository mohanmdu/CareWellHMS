package com.pms.website.dto;

/** Public-safe projection of CmsTestimonial - Testimonials page. */
public record PublicTestimonialDto(
        Long id,
        String patientName,
        String quote,
        Integer rating,
        String imageUrl) {
}
