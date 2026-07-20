package com.pms.lab.dto;

import java.time.LocalDateTime;
import java.util.List;

public record LabTestEntrySaveDto(
        List<String> specimenTypes,
        LocalDateTime reportedDate,
        String remarks,
        List<LabTestResultInputDto> results) {
}
