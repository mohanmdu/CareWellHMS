package com.pms.pharmacy.dto;

import com.pms.pharmacy.entity.PharmacyReturnStatus;
import com.pms.pharmacy.entity.PharmacyReturnType;
import java.time.Instant;

public record PharmacyReturnSummaryDto(
        Long id,
        Long saleId,
        Long billNumber,
        Long patientId,
        String patientRegistrationNumber,
        String patientName,
        Long locationId,
        String locationName,
        PharmacyReturnType returnType,
        PharmacyReturnStatus status,
        Double totalAmount,
        String remarks,
        String submittedBy,
        Instant submittedAt,
        String approvedBy,
        Instant approvedAt) {
}
