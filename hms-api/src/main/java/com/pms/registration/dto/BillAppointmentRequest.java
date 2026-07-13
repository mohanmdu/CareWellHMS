package com.pms.registration.dto;

import com.pms.registration.entity.PaymentMode;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record BillAppointmentRequest(
        @NotNull @PositiveOrZero Double paidAmount,
        @PositiveOrZero Double discountAmount,
        @PositiveOrZero Double doctorReferralAmount,
        @NotNull PaymentMode paymentMode,
        String remarks) {
}
