package com.pms.registration.dto;

import com.pms.registration.entity.AppointmentStatus;
import com.pms.registration.entity.CancelledBy;
import com.pms.registration.entity.PaymentMode;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentDto(
        Long id,
        @NotNull Long patientId,
        String patientRegistrationNumber,
        String patientName,
        Integer patientAge,
        String patientGender,
        @NotNull Long consultantId,
        String consultantName,
        String departmentName,
        @NotNull LocalDate appointmentDate,
        @NotNull LocalTime slotTime,
        AppointmentStatus status,
        String notes,
        String cancellationReason,
        CancelledBy cancelledBy,
        Double invoicedAmount,
        Double paidAmount,
        Double discountAmount,
        Double doctorReferralAmount,
        PaymentMode paymentMode,
        String billingRemarks,
        Instant billedAt,
        Long invoiceNumber,
        String billedBy,
        Double refundAmount) {
}
