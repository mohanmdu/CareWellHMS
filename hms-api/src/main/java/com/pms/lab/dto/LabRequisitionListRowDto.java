package com.pms.lab.dto;

import java.time.LocalDateTime;

/** One row of the Lab & X-Ray/Scan Billing worklist (pending requisitions awaiting Approve/Cancel). */
public record LabRequisitionListRowDto(
        Long id,
        String patientUhid,
        String patientName,
        String patientType,
        String requisitionType,
        LocalDateTime requisitionDate,
        double invoiceAmount,
        String createdBy) {
}
