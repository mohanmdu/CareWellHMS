package com.pms.billing.entity;

/**
 * Replaces the legacy int/string status codes scattered across
 * AdminDaoImpl.getInvoiceDetails/updateInvoiceDetailsForRefund and the
 * cancelPayment/cancelPayment1 near-duplicate methods (migration doc §4.1).
 */
public enum InvoiceStatus {
    DRAFT,
    PAID,
    CANCELLED,
    REFUNDED
}
