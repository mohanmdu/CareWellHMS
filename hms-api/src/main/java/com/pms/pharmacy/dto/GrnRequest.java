package com.pms.pharmacy.dto;

import com.pms.pharmacy.entity.GrnStatus;
import com.pms.pharmacy.entity.PurchaseType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record GrnRequest(
        @NotNull Long supplierId,
        @NotNull PurchaseType purchaseType,
        @NotNull String invoiceNo,
        @NotNull LocalDate invoiceDate,
        String poNumber,
        @NotNull LocalDate grnDate,
        Double discountAmount,
        String creditNote,
        String debitNote,
        Double returnAmount,
        @NotEmpty List<@Valid GrnItemRequest> items,
        @NotNull GrnStatus status) {
}
