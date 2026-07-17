package com.pms.pharmacy.dto;

public record VendorOutstandingDto(Long supplierId, String supplierName, Double totalAmount, Double paidAmount, Double balanceAmount) {
}
