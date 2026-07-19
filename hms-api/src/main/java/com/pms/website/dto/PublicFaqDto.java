package com.pms.website.dto;

/** Public-safe projection of CmsFaq - FAQ page. */
public record PublicFaqDto(Long id, String question, String answer, Integer sortOrder) {
}
