package com.pms.icd.entity;

import com.pms.common.Auditable;
import com.pms.masters.entity.Consultant;
import com.pms.masters.entity.Department;
import com.pms.registration.entity.Patient;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A single ICD diagnosis assigned to a patient (the "Assigned ICD Codes"
 * table row). Soft-deleted via `active` so Delete keeps the row for history
 * instead of losing it; create/update/delete are all recorded through the
 * shared ActivityLogService (module "ICD Diagnosis") rather than a bespoke
 * diff-audit table, reusing the content/previousContent convention already
 * built for the IP/OP Billing Activity Log.
 */
@Entity
@Table(name = "patient_diagnosis")
@Getter
@Setter
@NoArgsConstructor
public class PatientDiagnosis extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "icd_code_id", nullable = false)
    private IcdCode icdCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "diagnosis_type", nullable = false, length = 16)
    private DiagnosisType diagnosisType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultant_id")
    private Consultant consultant;

    @Column(name = "diagnosis_date", nullable = false)
    private LocalDate diagnosisDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private DiagnosisStatus status;

    @Enumerated(EnumType.STRING)
    @Column(length = 16)
    private DiagnosisSeverity severity;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "clinical_notes", columnDefinition = "TEXT")
    private String clinicalNotes;

    @Column(name = "added_by", length = 100)
    private String addedBy;

    @Column(nullable = false)
    private boolean active = true;
}
