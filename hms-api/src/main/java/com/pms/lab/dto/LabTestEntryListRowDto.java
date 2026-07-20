package com.pms.lab.dto;

import java.time.LocalDateTime;

/** One row of the Lab Entry Queue / Lab Draft Report worklists (statuses NEW and/or DRAFT). */
public record LabTestEntryListRowDto(
        Long id,
        String patientUhid,
        String patientName,
        String gender,
        String status,
        String mobileNumber,
        String createdBy,
        LocalDateTime requestedTime) {
}
