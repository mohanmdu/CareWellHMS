package com.pms.website.dto;

/**
 * Public-safe projection of Consultant for the website's Doctor Listing/Profile
 * pages - deliberately excludes email, mobileNumber and address (personal
 * contact details not meant for an unauthenticated response).
 */
public record PublicConsultantDto(
        Long id,
        String name,
        Long departmentId,
        String departmentName,
        String specializationName,
        String profile,
        double consultationFee,
        String imageUrl) {
}
