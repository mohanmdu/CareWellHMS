package com.pms.lab.entity;

/**
 * Distinct from com.pms.registration.entity.PaymentMode (Appointment/OP
 * Direct Billing's enum) - the reference Lab Billing screen shows a
 * different option set (Cheque/DD, Credit Patient, no Net Banking/Insurance),
 * so this is its own enum rather than repurposing the shared one and risking
 * a behavior change in those already-shipped OP billing screens.
 */
public enum LabPaymentMode {
    CASH,
    CARD,
    CHEQUE_DD,
    ONLINE_FUND_TRANSFER,
    UPI,
    CREDIT_PATIENT
}
