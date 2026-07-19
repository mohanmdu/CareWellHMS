package com.pms.settings.dto;

import jakarta.validation.constraints.NotBlank;

public record ClinicSettingsDto(
        @NotBlank String name,
        String address,
        String phone,
        String email,
        String logoUrl,
        String tinNo,
        String dlNo,
        Boolean websiteEnabled,
        String domain,
        String themePrimaryColor,
        String themeSecondaryColor,
        String faviconUrl,
        String seoDefaultTitle,
        String seoDefaultDescription,
        String socialFacebookUrl,
        String socialInstagramUrl,
        String socialYoutubeUrl,
        String whatsappNumber) {
}
