package com.pms.insurance.entity;

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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Replaces the legacy com.pms.model.InsuranceDetails, owned by IPAction in
 * the legacy app despite being conceptually its own domain (migration doc
 * §4.5) - given its own bounded context/controller here per the doc's
 * target-architecture recommendation (§5). Status/type are explicit enums
 * replacing the legacy's hardcoded strings ("Pre-Authorization Pending",
 * "Enhancement Pending") and the confirmed String == reference-equality bug.
 */
@Entity
@Table(name = "insurance_claim")
@Getter
@Setter
@NoArgsConstructor
public class InsuranceClaim extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "claim_number", nullable = false, unique = true)
    private String claimNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "policy_number", nullable = false)
    private String policyNumber;

    @Column(name = "insurer_name", nullable = false)
    private String insurerName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private InsuranceClaimType claimType;

    @Column(name = "requested_amount", nullable = false)
    private double requestedAmount;

    @Column(name = "approved_amount")
    private Double approvedAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private InsuranceClaimStatus status = InsuranceClaimStatus.PENDING;

    @Column(name = "decision_reason")
    private String decisionReason;
}
