package com.pms.pharmacy.dto;

import com.pms.pharmacy.entity.PharmacyBillingType;
import com.pms.pharmacy.entity.PharmacyPaymentMode;
import com.pms.pharmacy.entity.PharmacySaleSource;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record PharmacySaleRequest(
        @NotNull Long patientId,
        @NotNull Long locationId,
        @NotNull PharmacySaleSource source,
        Long pharmacyRequestId,
        @NotNull PharmacyBillingType billingType,
        @NotNull PharmacyPaymentMode paymentMode,
        Long consultantId,
        Double discountPercent,
        Double discountAmount,
        String discountReason,
        @NotEmpty List<@Valid PharmacySaleItemRequest> items,
        @NotNull Double amountPaid,
        String remarks) {
}
