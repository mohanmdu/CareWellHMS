package com.pms.lab.dto;

public record LabTestResultDto(
        Long componentId,
        String subCategoryName,
        String componentName,
        String sampleType,
        String method,
        String normalRange,
        String units,
        String maleRangeFrom,
        String maleRangeTo,
        String femaleRangeFrom,
        String femaleRangeTo,
        String resultValue,
        boolean abnormal) {
}
