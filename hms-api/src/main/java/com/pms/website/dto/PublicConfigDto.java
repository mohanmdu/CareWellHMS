package com.pms.website.dto;

/**
 * Public-safe projection of ClinicSettings - deliberately excludes tinNo/dlNo
 * (internal tax/license identifiers) and anything else not meant to appear in
 * an unauthenticated response. The public website's first API call.
 */
public record PublicConfigDto(
        String name,
        String logoUrl,
        String faviconUrl,
        Boolean websiteEnabled,
        String domain,
        String themePrimaryColor,
        String themeSecondaryColor,
        String seoDefaultTitle,
        String seoDefaultDescription,
        String socialFacebookUrl,
        String socialInstagramUrl,
        String socialYoutubeUrl,
        String whatsappNumber,
        String phone,
        String email,
        String address) {
}
