package com.pms.lab.dto;

import java.time.LocalDateTime;

public record LabCancelledReportRowDto(
        Long requisitionId, String patientUhid, String patientName, Long invoiceNumber, String typeLabel, double amount, LocalDateTime requisitionDate) {
}
