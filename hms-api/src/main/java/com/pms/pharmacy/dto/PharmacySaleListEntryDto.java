package com.pms.pharmacy.dto;

import com.pms.pharmacy.entity.PharmacyBillingType;
import com.pms.pharmacy.entity.PharmacyPaymentMode;
import com.pms.pharmacy.entity.PharmacySaleSource;
import java.time.Instant;

public record PharmacySaleListEntryDto(
        Long id,
        Long billNumber,
        String patientName,
        PharmacySaleSource source,
        PharmacyBillingType billingType,
        PharmacyPaymentMode paymentMode,
        Instant billedAt,
        String billedBy,
        Double totalAmount,
        Double discountAmount,
        Double amountPaid,
        Double balanceAmount) {
}
