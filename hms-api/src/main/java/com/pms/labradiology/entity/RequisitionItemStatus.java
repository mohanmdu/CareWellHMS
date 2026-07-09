package com.pms.labradiology.entity;

/**
 * Replaces the legacy LabAction.labResultSave's raw int "byPass" flag
 * (1=save, 2=approve - migration doc §4.4) with a named state machine.
 * Also covers CT/Xray, since those are a LabCategory-billed variant of this
 * same requisition/result/approval flow, not a separate code path.
 */
public enum RequisitionItemStatus {
    PENDING,
    SPECIMEN_COLLECTED,
    RESULT_ENTERED,
    APPROVED
}
