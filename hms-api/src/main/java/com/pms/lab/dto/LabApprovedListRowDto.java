package com.pms.lab.dto;

import java.time.LocalDateTime;

/** One row of the Approved Lab Reports / Reports Share to WhatsApp ledger. */
public record LabApprovedListRowDto(
        Long id,
        String patientUhid,
        String patientName,
        String mobileNumber,
        String consultantName,
        String patientType,
        String gender,
        String updatedBy,
        LocalDateTime requestedTime) {
}
