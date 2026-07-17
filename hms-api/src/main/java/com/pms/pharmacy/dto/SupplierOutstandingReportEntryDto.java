package com.pms.pharmacy.dto;

import java.time.LocalDate;

public record SupplierOutstandingReportEntryDto(
        Long grnId, String vendorName, LocalDate date, String invoiceNo, Double totalAmount, Double paidAmount, Double balanceAmount) {
}
