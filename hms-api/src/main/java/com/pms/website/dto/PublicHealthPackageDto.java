package com.pms.website.dto;

/** Public-safe projection of CmsHealthPackage - Health Packages page. */
public record PublicHealthPackageDto(Long id, String name, String description, double price, String includes) {
}
