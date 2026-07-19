package com.pms.dischargesummary.dto;

import java.time.LocalDateTime;

/** One card of the Discharge Initiated List - admissions whose discharge has been initiated but not yet finalized. */
public record DischargeInitiatedRowDto(
        Long admissionId,
        String admissionNumber,
        String patientUhid,
        String patientName,
        String gender,
        Integer age,
        String mobileNumber,
        String address,
        LocalDateTime admissionDate,
        String paymentType,
        String wardLocation,
        String diagnosis,
        String primaryConsultant) {
}
