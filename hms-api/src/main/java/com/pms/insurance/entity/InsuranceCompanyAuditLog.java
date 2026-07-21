package com.pms.insurance.entity;

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
 * Append-only audit trail for Insurance Company create/deactivate/restore
 * operations, mirroring RoomTypeAuditLog - drives the "Created By & Date" /
 * "Deactivated By & Date" columns on the Insurance Companies screen.
 */
@Entity
@Table(name = "insurance_company_audit_log")
@Getter
@Setter
@NoArgsConstructor
public class InsuranceCompanyAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "insurance_company_id", nullable = false)
    private Long insuranceCompanyId;

    @Column(name = "insurance_company_name", nullable = false)
    private String insuranceCompanyName;

    @Column(nullable = false, length = 32)
    private String operation;

    @Column(name = "performed_by", nullable = false, length = 100)
    private String performedBy;

    @Column(name = "performed_at", nullable = false)
    private Instant performedAt;

    public InsuranceCompanyAuditLog(Long insuranceCompanyId, String insuranceCompanyName, String operation, String performedBy) {
        this.insuranceCompanyId = insuranceCompanyId;
        this.insuranceCompanyName = insuranceCompanyName;
        this.operation = operation;
        this.performedBy = performedBy;
        this.performedAt = Instant.now();
    }
}
