package com.pms.pharmacy.entity;

import com.pms.common.Auditable;
import com.pms.registration.entity.Patient;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A pending drug request awaiting Pharmacy Billing (migration doc's "Drug
 * Requests for Cashier Approval" list). Nothing in this codebase creates
 * these yet - OpCaseSheet's prescriptionItems are free-text with no Product
 * FK, so wiring OP/IP prescribing to auto-create requests is a separate,
 * larger follow-up. This entity/list/search is built now so that
 * integration is a pure creation-side addition later, not a schema change.
 */
@Entity
@Table(name = "pharmacy_request")
@Getter
@Setter
@NoArgsConstructor
public class PharmacyRequest extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PharmacyRequestSource source;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PharmacyRequestStatus status = PharmacyRequestStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private PharmacyLocation location;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    private List<PharmacyRequestItem> items = new ArrayList<>();
}
