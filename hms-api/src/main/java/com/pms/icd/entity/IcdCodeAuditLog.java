package com.pms.icd.entity;

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
 * Append-only audit trail for ICD Code Master create/update/deactivate/restore,
 * mirroring ConsultantAuditLog - drives the "Created By"/"Last Updated" columns
 * on the ICD Code Master screen.
 */
@Entity
@Table(name = "icd_code_audit_log")
@Getter
@Setter
@NoArgsConstructor
public class IcdCodeAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "icd_code_id", nullable = false)
    private Long icdCodeId;

    @Column(name = "icd_code", nullable = false, length = 20)
    private String icdCode;

    @Column(nullable = false, length = 32)
    private String operation;

    @Column(name = "performed_by", nullable = false, length = 100)
    private String performedBy;

    @Column(name = "performed_at", nullable = false)
    private Instant performedAt;

    public IcdCodeAuditLog(Long icdCodeId, String icdCode, String operation, String performedBy) {
        this.icdCodeId = icdCodeId;
        this.icdCode = icdCode;
        this.operation = operation;
        this.performedBy = performedBy;
        this.performedAt = Instant.now();
    }
}
