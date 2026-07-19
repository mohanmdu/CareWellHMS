package com.pms.activitylog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Append-only, cross-module transaction audit trail (IP/OP Billing Activity
 * Log / "IP/OP Tracking Report"). Distinct from the existing per-master
 * *AuditLog family (ConsultantAuditLog, DepartmentAuditLog,
 * IpBillingComponentAuditLog, ...), which each record master-data
 * create/update/deactivate/restore history for one specific entity - this
 * table records real business transactions (admission lifecycle, IP billing
 * line items, cashier payment requests) across whichever module performed
 * them, keyed loosely by patient/OP/IP number rather than a single FK.
 * content/previousContent are human-readable snapshots built at the call
 * site (same convention as IpBillingComponentAuditLog), not generic
 * reflection-based diffs.
 */
@Entity
@Table(name = "activity_log")
@Getter
@Setter
@NoArgsConstructor
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String module;

    @Column(nullable = false, length = 64)
    private String operation;

    @Column(length = 1000)
    private String content;

    @Column(name = "previous_content", length = 1000)
    private String previousContent;

    @Column(name = "performed_by", nullable = false, length = 100)
    private String performedBy;

    @Column(name = "performed_at", nullable = false)
    private Instant performedAt;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(name = "patient_uhid")
    private String patientUhid;

    @Column(name = "patient_name")
    private String patientName;

    @Column(name = "op_number")
    private String opNumber;

    @Column(name = "ip_number")
    private String ipNumber;

    @Column(name = "screen_name")
    private String screenName;

    @Column(length = 500)
    private String remarks;
}
