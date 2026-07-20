package com.pms.lab.dto;

import jakarta.validation.constraints.NotNull;

public record LabTestResultInputDto(@NotNull Long componentId, String resultValue, boolean abnormal) {
}
