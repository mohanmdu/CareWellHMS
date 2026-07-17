package com.pms.pharmacy.dto;

import java.time.LocalDate;

public record InvoiceOutstandingDto(
        Long grnId,
        Long supplierId,
        String supplierName,
        String invoiceNo,
        LocalDate invoiceDate,
        LocalDate grnDate,
        Double totalAmount,
        Double paidAmount,
        Double amountToPay) {
}
