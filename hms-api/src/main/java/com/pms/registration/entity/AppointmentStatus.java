package com.pms.registration.entity;

/**
 * Replaces the legacy magic-string/status-int approach scattered across
 * AdminAction's ~10 near-duplicate cancel methods (migration doc §4.1) with
 * one explicit state machine.
 */
public enum AppointmentStatus {
    BOOKED,
    CONFIRMED,
    CANCELLED,
    COMPLETED
}
