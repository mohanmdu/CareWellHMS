package com.pms.pharmacy.dto;

import java.time.Instant;
import java.util.List;

public record PharmacyReturnInvoiceDto(
        Long saleId,
        Long billNumber,
        Instant billedAt,
        Long patientId,
        String patientRegistrationNumber,
        String patientName,
        String consultantName,
        Long locationId,
        String locationName,
        List<PharmacyReturnInvoiceItemDto> items) {
}
