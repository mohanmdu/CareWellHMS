package com.pms.ipadmission.entity;

import com.pms.common.Auditable;
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
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Replaces the legacy IPAction admission/billing/discharge flow (createIPAdmission,
 * patientAdvanceRequest(Confirm), IpDischargeInputBydate, finalizeDischarge,
 * getDetailForIPRefund/balanceRefundUpdate - migration doc §4.2). Ward
 * charges are billed through the existing generic Invoice system (same one
 * used by OP Billing and Lab), not duplicated here - this entity owns only
 * the admission lifecycle and the advance/settlement math.
 *
 * Simplification vs. the full legacy flow: totalBilled is entered by the
 * cashier at discharge rather than auto-summed from linked invoices - wiring
 * Invoice to an admissionId and summing automatically is the natural next
 * iteration, called out explicitly rather than silently approximated.
 */
@Entity
@Table(name = "admission")
@Getter
@Setter
@NoArgsConstructor
public class Admission extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admission_number", nullable = false, unique = true)
    private String admissionNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    // Nullable: set only once Ward Allocation (AdmissionService.admitRegistered)
    // finalizes the bed assignment. Until then the admission sits at
    // status = REGISTERED with only a roomType preference, matching the
    // legacy's two-step register-then-admit flow.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    /** Room type preference captured at registration, before a specific room/bed is picked. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_type_id")
    private RoomType roomType;

    @Column(name = "admission_date", nullable = false)
    private LocalDateTime admissionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private AdmissionStatus status = AdmissionStatus.ADMITTED;

    @Column(name = "advance_amount", nullable = false)
    private double advanceAmount = 0;

    @Column(name = "total_billed")
    private Double totalBilled;

    // Positive = refund owed to patient (advance > bill), negative = balance
    // due from patient (bill > advance) - replaces the legacy's separate
    // ad hoc refund/balance-due code paths with one signed field.
    @Column(name = "settlement_amount")
    private Double settlementAmount;

    @Column(name = "discharge_date")
    private LocalDateTime dischargeDate;

    @Column(name = "discharge_summary", length = 2000)
    private String dischargeSummary;

    /** Regular Discharge / Death / Against Medical Advice / Absconding - set at Initiate Discharge. */
    @Column(name = "discharge_type")
    private String dischargeType;

    /** Assigned once Finalize Discharge transitions the admission to DISCHARGED. */
    @Column(name = "discharge_number")
    private String dischargeNumber;

    // --- Registration/intake fields captured at IP Admission Advice (Step 1) ---

    @Column(name = "attender_name")
    private String attenderName;

    @Column(name = "relation_type")
    private String relationType;

    @Column(name = "father_spouse_name")
    private String fatherSpouseName;

    @Column(name = "relation_mobile_no")
    private String relationMobileNo;

    private String occupation;

    @Column(name = "marital_status")
    private String maritalStatus;

    @Column(name = "period_of_stay_days")
    private Integer periodOfStayDays;

    @Column(name = "description_of_case")
    private String descriptionOfCase;

    @Column(name = "referral_doctor")
    private String referralDoctor;

    @Column(name = "primary_consultant")
    private String primaryConsultant;

    @Column(name = "secondary_consultant")
    private String secondaryConsultant;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", length = 32)
    private AdmissionPaymentType paymentType;

    @Column(name = "height_cm")
    private Double heightCm;

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(nullable = false)
    private boolean mlc = false;

    @Column(name = "insurance_type")
    private String insuranceType;

    @Column(name = "patient_type")
    private String patientType;

    @Column(length = 1000)
    private String remarks;

    @Column(name = "aadhaar_number")
    private String aadhaarNumber;

    @Column(name = "ventilator_required", nullable = false)
    private boolean ventilatorRequired = false;

    @Column(name = "monitor_required", nullable = false)
    private boolean monitorRequired = false;

    @Column(name = "photo_path")
    private String photoPath;
}
