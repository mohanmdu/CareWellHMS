package com.pms.lab.dto;

import java.util.List;

public record LabCategoryTestGroupDto(Long categoryId, String categoryName, List<LabTestOptionDto> tests) {
}
