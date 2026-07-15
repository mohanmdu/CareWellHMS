package com.pms.pharmacy.dto;

import com.pms.pharmacy.entity.GrnStatus;
import java.time.LocalDate;

public record GrnListEntryDto(
        Long id,
        String supplierName,
        String invoiceNo,
        LocalDate grnDate,
        Double grnAmount,
        GrnStatus status) {
}
