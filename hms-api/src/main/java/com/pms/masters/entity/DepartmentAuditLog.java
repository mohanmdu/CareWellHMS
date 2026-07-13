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
 * Append-only audit trail for department create/deactivate/restore
 * operations, mirroring PatientAuditLog - drives the "Created by" /
 * "Deactivated by" columns on the Departments screen.
 */
@Entity
@Table(name = "department_audit_log")
@Getter
@Setter
@NoArgsConstructor
public class DepartmentAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    @Column(name = "department_name", nullable = false)
    private String departmentName;

    @Column(nullable = false, length = 32)
    private String operation;

    @Column(name = "performed_by", nullable = false, length = 100)
    private String performedBy;

    @Column(name = "performed_at", nullable = false)
    private Instant performedAt;

    public DepartmentAuditLog(Long departmentId, String departmentName, String operation, String performedBy) {
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.operation = operation;
        this.performedBy = performedBy;
        this.performedAt = Instant.now();
    }
}
