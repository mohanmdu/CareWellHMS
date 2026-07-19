package com.pms.ipadmission.entity;

/**
 * DISCHARGE_INITIATED is the middle step of the three-state discharge
 * lifecycle (PDF p.13): Initiate Discharge (sets dischargeDate/dischargeType,
 * room still occupied) -> Finalize Discharge (settles the balance, frees the
 * room, transitions straight to DISCHARGED).
 */
public enum AdmissionStatus {
    REGISTERED,
    ADMITTED,
    DISCHARGE_INITIATED,
    DISCHARGED
}
