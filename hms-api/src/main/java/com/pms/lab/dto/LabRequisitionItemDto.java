package com.pms.lab.dto;

public record LabRequisitionItemDto(Long id, Long subCategoryId, String categoryName, String subCategoryName, double amount) {
}
