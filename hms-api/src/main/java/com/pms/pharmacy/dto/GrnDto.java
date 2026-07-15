package com.pms.pharmacy.dto;

import com.pms.pharmacy.entity.GrnStatus;
import com.pms.pharmacy.entity.PurchaseType;
import java.time.LocalDate;
import java.util.List;

public record GrnDto(
        Long id,
        Long supplierId,
        String supplierName,
        String supplierAddress,
        String supplierMobileNumber,
        PurchaseType purchaseType,
        String invoiceNo,
        LocalDate invoiceDate,
        Double invoiceAmount,
        String poNumber,
        LocalDate grnDate,
        Double grnAmount,
        Double discountAmount,
        String creditNote,
        String debitNote,
        Double returnAmount,
        GrnStatus status,
        List<GrnItemDto> items,
        String createdBy) {
}
