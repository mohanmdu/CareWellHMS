package com.pms.lab.dto;

import java.time.LocalDateTime;
import java.util.List;

public record LabTestEntryDto(
        Long id,
        String patientUhid,
        String patientName,
        Integer age,
        String gender,
        String mobileNumber,
        String consultantName,
        String status,
        String specimenTypes,
        LocalDateTime reportedDate,
        String remarks,
        String createdBy,
        String updatedBy,
        List<LabTestResultDto> results) {
}
