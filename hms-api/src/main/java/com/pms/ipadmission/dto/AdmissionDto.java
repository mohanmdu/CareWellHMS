package com.pms.ipadmission.dto;

import com.pms.ipadmission.entity.AdmissionPaymentType;
import com.pms.ipadmission.entity.AdmissionStatus;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record AdmissionDto(
        Long id,
        String admissionNumber,
        @NotNull Long patientId,
        String patientName,
        Long roomId,
        String roomNumber,
        Long roomTypeId,
        String roomTypeName,
        LocalDateTime admissionDate,
        AdmissionStatus status,
        Double advanceAmount,
        Double totalBilled,
        Double settlementAmount,
        LocalDateTime dischargeDate,
        String dischargeSummary,
        String attenderName,
        String relationType,
        String fatherSpouseName,
        String relationMobileNo,
        String occupation,
        String maritalStatus,
        Integer periodOfStayDays,
        String descriptionOfCase,
        String referralDoctor,
        String primaryConsultant,
        String secondaryConsultant,
        AdmissionPaymentType paymentType,
        Double heightCm,
        Double weightKg,
        Boolean mlc,
        String insuranceType,
        String patientType,
        String remarks,
        String aadhaarNumber,
        Boolean ventilatorRequired,
        Boolean monitorRequired,
        String photoPath) {
}
