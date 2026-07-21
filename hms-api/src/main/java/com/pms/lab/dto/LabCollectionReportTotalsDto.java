package com.pms.lab.dto;

public record LabCollectionReportTotalsDto(
        double invoiceAmount,
        double doctorReferralAmount,
        double discountAmount,
        double receiptAmount,
        double refundAmount,
        double totalCollectionAmount) {
}
