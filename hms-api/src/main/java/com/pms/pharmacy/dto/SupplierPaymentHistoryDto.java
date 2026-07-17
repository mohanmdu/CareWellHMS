package com.pms.pharmacy.dto;

import java.time.Instant;

public record SupplierPaymentHistoryDto(
        Long id, String paidBy, Instant paidAt, String payMode, String transactionId, String remarks, Double amount) {
}
