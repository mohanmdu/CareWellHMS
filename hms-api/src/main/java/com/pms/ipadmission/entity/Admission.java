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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

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
}
