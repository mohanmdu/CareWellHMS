package com.pms.pharmacy.dto;

public record PharmacyRequestItemDto(Long id, Long productId, String drugName, Integer qty) {
}
