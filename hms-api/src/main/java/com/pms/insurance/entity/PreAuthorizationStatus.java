package com.pms.insurance.entity;

public enum PreAuthorizationStatus {
    /** Auto-seeded from an Admission with insuranceType != "None" - not yet actually submitted (see PreAuthorizationRequestService.seedFromAdmission()). */
    YET_TO_BE_RAISED,
    PENDING,
    APPROVED,
    REJECTED,
    CANCELLED
}
