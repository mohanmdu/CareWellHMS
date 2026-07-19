package com.pms.ipbilling.dto;

import java.time.LocalDateTime;

/** One row of the IP Admission Report - per-admission billing snapshot (PDF: "Admission Details"). */
public record AdmissionReportRowDto(
        Long admissionId,
        String admissionNumber,
        String patientUhid,
        String patientName,
        String patientGender,
        String paymentType,
        LocalDateTime admissionDate,
        LocalDateTime dischargeDate,
        String roomNumber,
        String roomTypeName,
        double invoiceAmount,
        double amountPaid) {
}
