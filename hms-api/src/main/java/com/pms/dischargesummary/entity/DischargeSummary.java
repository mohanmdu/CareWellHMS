package com.pms.dischargesummary.entity;

import com.pms.common.Auditable;
import com.pms.ipadmission.entity.Admission;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The IP Discharge Summary clinical document (one row per Admission, 1:1) -
 * the reference form's many free-text fields map directly onto columns here;
 * the handful of dynamic "add another line" lists in the reference (Consultants,
 * Diagnosis, Procedures, Impression, Emergency Symptoms) are stored as a
 * single newline-delimited TEXT column each rather than five separate
 * @ElementCollection child tables, since they're plain ordered strings with
 * no per-item metadata - simplest thing that round-trips correctly.
 */
@Entity
@Table(name = "discharge_summary")
@Getter
@Setter
@NoArgsConstructor
public class DischargeSummary extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admission_id", nullable = false, unique = true)
    private Admission admission;

    // --- Header ---
    @Column(name = "consultants_text", columnDefinition = "TEXT")
    private String consultantsText;

    @Column(name = "referred_by")
    private String referredBy;

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(name = "rcn_no")
    private String rcnNo;

    private String title;

    @Column(name = "blood_group")
    private String bloodGroup;

    @Column(name = "diagnosis_text", columnDefinition = "TEXT")
    private String diagnosisText;

    @Column(name = "procedures_text", columnDefinition = "TEXT")
    private String proceduresText;

    // --- History ---
    @Column(name = "brief_history", columnDefinition = "TEXT")
    private String briefHistory;

    @Column(name = "past_history", columnDefinition = "TEXT")
    private String pastHistory;

    @Column(name = "personal_history", columnDefinition = "TEXT")
    private String personalHistory;

    @Column(name = "surgical_history", columnDefinition = "TEXT")
    private String surgicalHistory;

    @Column(name = "family_history", columnDefinition = "TEXT")
    private String familyHistory;

    @Column(columnDefinition = "TEXT")
    private String intolerance;

    @Column(columnDefinition = "TEXT")
    private String immunization;

    @Column(name = "menstrual_history", columnDefinition = "TEXT")
    private String menstrualHistory;

    @Column(name = "marital_history", columnDefinition = "TEXT")
    private String maritalHistory;

    @Column(name = "obstetric_history", columnDefinition = "TEXT")
    private String obstetricHistory;

    // --- Clinical examination ---
    @Column(name = "general_examination", columnDefinition = "TEXT")
    private String generalExamination;

    @Column(name = "temp_f")
    private String tempF;

    private String pr;
    private String bp;
    private String rr;
    private String spo2;
    private String cbg;

    @Column(columnDefinition = "TEXT")
    private String cvs;

    @Column(columnDefinition = "TEXT")
    private String rs;

    @Column(columnDefinition = "TEXT")
    private String abdomen;

    @Column(columnDefinition = "TEXT")
    private String cns;

    @Column(name = "local_examination", columnDefinition = "TEXT")
    private String localExamination;

    // --- Investigations (one free-text block per named investigation type) ---
    @Column(name = "investigation_xray", columnDefinition = "TEXT")
    private String investigationXray;

    @Column(name = "investigation_ecg", columnDefinition = "TEXT")
    private String investigationEcg;

    @Column(name = "investigation_echo", columnDefinition = "TEXT")
    private String investigationEcho;

    @Column(name = "investigation_tmt", columnDefinition = "TEXT")
    private String investigationTmt;

    @Column(name = "investigation_usg_abdomen", columnDefinition = "TEXT")
    private String investigationUsgAbdomen;

    @Column(name = "investigation_usg_pelvis", columnDefinition = "TEXT")
    private String investigationUsgPelvis;

    @Column(name = "investigation_endoscopy", columnDefinition = "TEXT")
    private String investigationEndoscopy;

    @Column(name = "investigation_colonoscopy", columnDefinition = "TEXT")
    private String investigationColonoscopy;

    @Column(name = "investigation_sigmoidoscopy", columnDefinition = "TEXT")
    private String investigationSigmoidoscopy;

    @Column(name = "investigation_mri_scan", columnDefinition = "TEXT")
    private String investigationMriScan;

    @Column(name = "investigation_doppler_study", columnDefinition = "TEXT")
    private String investigationDopplerStudy;

    @Column(name = "investigation_nerve_conduction", columnDefinition = "TEXT")
    private String investigationNerveConduction;

    // --- Blood investigations ---
    @Column(name = "blood_investigation_date")
    private LocalDate bloodInvestigationDate;

    private String hemoglobin;

    @Column(name = "blood_urea")
    private String bloodUrea;

    @Column(name = "sr_creatinine")
    private String srCreatinine;

    private String sodium;
    private String potassium;
    private String hba1c;

    @Column(name = "or_enclosed")
    private String orEnclosed;

    // --- Coronary angiogram ---
    @Column(name = "angiogram_date")
    private LocalDate angiogramDate;

    @Column(name = "angiogram_site")
    private String angiogramSite;

    @Column(name = "angiogram_artery")
    private String angiogramArtery;

    @Column(name = "angiogram_procedure", columnDefinition = "TEXT")
    private String angiogramProcedure;

    private String lmca;
    private String lad;
    private String lcx;
    private String rca;

    @Column(name = "impression_text", columnDefinition = "TEXT")
    private String impressionText;

    @Column(columnDefinition = "TEXT")
    private String recommendation;

    @Column(name = "treatment_given", columnDefinition = "TEXT")
    private String treatmentGiven;

    @Column(name = "course_in_hospital", columnDefinition = "TEXT")
    private String courseInHospital;

    // --- Discharge advice ---
    @Column(columnDefinition = "TEXT")
    private String review;

    @Column(name = "diet_advice", columnDefinition = "TEXT")
    private String dietAdvice;

    @Column(columnDefinition = "TEXT")
    private String physiotherapy;

    @Column(name = "physical_activity", columnDefinition = "TEXT")
    private String physicalActivity;

    @Column(columnDefinition = "TEXT")
    private String advice;

    @Column(name = "review_description", columnDefinition = "TEXT")
    private String reviewDescription;

    @Column(name = "condition_at_discharge", columnDefinition = "TEXT")
    private String conditionAtDischarge;

    @Column(name = "emergency_contact_numbers")
    private String emergencyContactNumbers;

    @Column(name = "emergency_symptoms_text", columnDefinition = "TEXT")
    private String emergencySymptomsText;

    @Column(name = "checked_by")
    private String checkedBy;

    @Column(name = "consultant_sign_off")
    private String consultantSignOff;

    @OneToMany(mappedBy = "dischargeSummary", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC")
    private List<DischargeSurgeryProcedure> surgeryProcedures = new ArrayList<>();

    @OneToMany(mappedBy = "dischargeSummary", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC")
    private List<DischargeAdviseDrug> adviseDrugs = new ArrayList<>();
}
