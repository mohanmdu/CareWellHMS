package com.pms.pharmacy.dto;

import com.pms.pharmacy.entity.PharmacyRequestSource;
import com.pms.pharmacy.entity.PharmacyRequestStatus;
import java.time.Instant;
import java.util.List;

public record PharmacyRequestDto(
        Long id,
        Long patientId,
        String patientRegistrationNumber,
        String patientName,
        String mobileNumber,
        PharmacyRequestSource source,
        PharmacyRequestStatus status,
        List<PharmacyRequestItemDto> items,
        String createdBy,
        Instant createdAt) {
}
