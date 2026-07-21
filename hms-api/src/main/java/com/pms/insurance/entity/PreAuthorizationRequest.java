package com.pms.insurance.entity;

import com.pms.common.Auditable;
import com.pms.ipadmission.entity.Admission;
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
 * A Pre Authorization Request against a patient's insurance - either
 * auto-seeded from an Admission (status YET_TO_BE_RAISED, admission set,
 * policyNumber/insurerName not yet known) when its insuranceType != "None",
 * or raised directly by staff (status PENDING immediately, admission null).
 * Replaces the earlier generic InsuranceClaim (PRE_AUTHORIZATION/ENHANCEMENT
 * claimType in one flat grid) - Enhancement requests aren't modeled here.
 */
@Entity
@Table(name = "pre_authorization_request")
@Getter
@Setter
@NoArgsConstructor
public class PreAuthorizationRequest extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_number", nullable = false, unique = true)
    private String requestNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admission_id")
    private Admission admission;

    @Column(name = "policy_number")
    private String policyNumber;

    @Column(name = "card_number")
    private String cardNumber;

    @Column(name = "insurer_name")
    private String insurerName;

    @Column(name = "tpa_name")
    private String tpaName;

    @Column(name = "corporate_name")
    private String corporateName;

    @Column(name = "requested_amount", nullable = false)
    private double requestedAmount;

    @Column(name = "approved_amount")
    private Double approvedAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PreAuthorizationStatus status = PreAuthorizationStatus.PENDING;

    @Column(name = "decision_reason")
    private String decisionReason;

    @Column(name = "raised_at")
    private LocalDateTime raisedAt;

    @Column(name = "raised_by", length = 100)
    private String raisedBy;
}
