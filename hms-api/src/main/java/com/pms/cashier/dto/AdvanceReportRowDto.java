package com.pms.cashier.dto;

import java.time.Instant;

/** One approved cashier request (PDF: "Advance Report") - exactly one of advanceAmount/finalSettlementAmount/dueAmountPaid is non-zero, matching its requestType. */
public record AdvanceReportRowDto(
        String patientUhid,
        String patientName,
        String patientGender,
        String admissionNumber,
        String approvedBy,
        Instant approvedAt,
        double advanceAmount,
        double finalSettlementAmount,
        double dueAmountPaid,
        double total) {
}
