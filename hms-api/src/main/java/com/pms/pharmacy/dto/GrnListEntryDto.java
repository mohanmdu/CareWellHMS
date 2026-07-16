package com.pms.pharmacy.dto;

import com.pms.pharmacy.entity.GrnStatus;
import java.time.Instant;
import java.time.LocalDate;

public record GrnListEntryDto(
        Long id,
        String supplierName,
        String invoiceNo,
        LocalDate invoiceDate,
        Double netAmount,
        Double sgstAmount,
        Double cgstAmount,
        Double invoiceAmount,
        LocalDate grnDate,
        Double grnAmount,
        GrnStatus status,
        String createdBy,
        Instant createdAt) {
}
