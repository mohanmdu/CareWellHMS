package com.pms.registration.entity;

/** Which billing entity a Refund is against - see Refund.appointment/opDirectBilling (exactly one is set). */
public enum RefundSource {
    APPOINTMENT,
    DIRECT_BILLING
}
