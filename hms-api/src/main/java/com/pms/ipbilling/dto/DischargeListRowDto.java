package com.pms.ipbilling.dto;

import java.time.LocalDateTime;

/** One row of the Discharge List (PDF) - full invoiced/paid/refund/discount/balance breakdown for a DISCHARGED admission. */
public record DischargeListRowDto(
        Long admissionId,
        String admissionNumber,
        String patientUhid,
        String patientName,
        String patientGender,
        String billingType,
        String insuranceType,
        LocalDateTime admissionDate,
        LocalDateTime dischargeDate,
        double invoicedAmount,
        double paidAmount,
        double refundAmount,
        double discountAmount,
        double balanceAmount) {
}
