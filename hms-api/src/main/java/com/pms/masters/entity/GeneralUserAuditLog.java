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
 * Append-only audit trail for general-user create/update/deactivate/restore
 * operations, mirroring DepartmentAuditLog/ConsultantAuditLog - drives the
 * "Created By"/"From Date"/"To Date" columns on the General Users screen.
 */
@Entity
@Table(name = "general_user_audit_log")
@Getter
@Setter
@NoArgsConstructor
public class GeneralUserAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "general_user_id", nullable = false)
    private Long generalUserId;

    @Column(name = "general_user_name", nullable = false)
    private String generalUserName;

    @Column(nullable = false, length = 32)
    private String operation;

    @Column(name = "performed_by", nullable = false, length = 100)
    private String performedBy;

    @Column(name = "performed_at", nullable = false)
    private Instant performedAt;

    public GeneralUserAuditLog(Long generalUserId, String generalUserName, String operation, String performedBy) {
        this.generalUserId = generalUserId;
        this.generalUserName = generalUserName;
        this.operation = operation;
        this.performedBy = performedBy;
        this.performedAt = Instant.now();
    }
}
