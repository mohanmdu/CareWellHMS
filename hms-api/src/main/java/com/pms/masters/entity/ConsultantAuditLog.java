package com.pms.masters.entity;

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
 * Append-only audit trail for consultant create/update/deactivate/restore
 * operations, mirroring DepartmentAuditLog - drives the "Created by & Date" /
 * "Edited by & Date" columns on the Consultants screen.
 */
@Entity
@Table(name = "consultant_audit_log")
@Getter
@Setter
@NoArgsConstructor
public class ConsultantAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "consultant_id", nullable = false)
    private Long consultantId;

    @Column(name = "consultant_name", nullable = false)
    private String consultantName;

    @Column(nullable = false, length = 32)
    private String operation;

    @Column(name = "performed_by", nullable = false, length = 100)
    private String performedBy;

    @Column(name = "performed_at", nullable = false)
    private Instant performedAt;

    public ConsultantAuditLog(Long consultantId, String consultantName, String operation, String performedBy) {
        this.consultantId = consultantId;
        this.consultantName = consultantName;
        this.operation = operation;
        this.performedBy = performedBy;
        this.performedAt = Instant.now();
    }
}
