package com.pms.masters.entity;

/**
 * Which slice of the CEO/MD Dashboard's revenue charts a billing category
 * belongs to. Tags IpBillingCategory, OpBillingCategory and
 * com.pms.lab.entity.LabCategory - all three are free-text, admin-typed
 * masters with no fixed taxonomy, so this is what makes "Consulting Fee" vs
 * "Room Rent" vs "Other" a deterministic admin setting instead of a guess
 * from the category's display name.
 */
public enum RevenueBucket {
    CONSULTING_FEE,
    LAB,
    RADIOLOGY,
    PHARMACY,
    OTHER
}
