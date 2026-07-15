package com.pms.pharmacy.dto;

import com.pms.pharmacy.entity.PharmacyBillingType;
import com.pms.pharmacy.entity.PharmacyPaymentMode;
import com.pms.pharmacy.entity.PharmacySaleSource;
import java.time.Instant;
import java.util.List;

public record PharmacySaleDto(
        Long id,
        Long billNumber,
        Long patientId,
        String patientRegistrationNumber,
        String patientName,
        String gender,
        Integer age,
        String mobileNumber,
        String address,
        Long locationId,
        String locationName,
        PharmacySaleSource source,
        PharmacyBillingType billingType,
        PharmacyPaymentMode paymentMode,
        Long consultantId,
        String consultantName,
        Double discountPercent,
        Double discountAmount,
        String discountReason,
        List<PharmacySaleItemDto> items,
        Double totalAmount,
        Double amountPaid,
        Double balanceAmount,
        String remarks,
        String billedBy,
        Instant billedAt) {
}
