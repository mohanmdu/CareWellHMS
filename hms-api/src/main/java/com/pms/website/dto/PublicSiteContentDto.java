package com.pms.website.dto;

/** Public-safe projection of the singleton CmsSiteContent - homepage/about copy. */
public record PublicSiteContentDto(
        String aboutUsBody,
        String missionBody,
        String visionBody,
        String homeIntroTitle,
        String homeIntroBody) {
}
