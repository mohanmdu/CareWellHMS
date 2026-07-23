package com.pms.ipbilling.dto;

import java.time.LocalDateTime;

/** One Lab/Investigation charge pulled into the IP Billing ledger's "Lab & Investigation Charges" row. */
public record IpBillingLabChargeDto(
        String categoryName,
        String subCategoryName,
        LocalDateTime requestedOn,
        double invoicedAmount,
        String requisitionNumber,
        String createdBy) {
}
