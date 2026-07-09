package com.pms.registration.entity;

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
 * Append-only audit trail for patient registration operations (register,
 * update, soft delete, restore, permanent delete), driving the Patient
 * Registration "Logs" screen. Scoped to the patient module rather than a
 * generic cross-entity audit log, since that's the only screen that needs
 * it today.
 */
@Entity
@Table(name = "patient_audit_log")
@Getter
@Setter
@NoArgsConstructor
public class PatientAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 32)
    private String operation;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Column(name = "performed_by", nullable = false, length = 100)
    private String performedBy;

    @Column(name = "performed_at", nullable = false)
    private Instant performedAt;

    public PatientAuditLog(String operation, String patientName, String performedBy) {
        this.operation = operation;
        this.patientName = patientName;
        this.performedBy = performedBy;
        this.performedAt = Instant.now();
    }
}
