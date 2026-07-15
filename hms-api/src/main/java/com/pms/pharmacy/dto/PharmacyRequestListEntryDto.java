package com.pms.pharmacy.dto;

import com.pms.pharmacy.entity.PharmacyRequestSource;
import com.pms.pharmacy.entity.PharmacyRequestStatus;
import java.time.Instant;

public record PharmacyRequestListEntryDto(
        Long id,
        String patientRegistrationNumber,
        String patientName,
        PharmacyRequestSource source,
        PharmacyRequestStatus status,
        String createdBy,
        Instant createdAt) {
}
