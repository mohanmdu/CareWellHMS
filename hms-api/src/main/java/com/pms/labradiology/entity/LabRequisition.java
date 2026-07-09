package com.pms.labradiology.entity;

import com.pms.common.Auditable;
import com.pms.registration.entity.Appointment;
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
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Replaces the legacy com.pms.model.Requisition/RequisitionDetails (migration
 * doc §4.4). Billing is deliberately NOT duplicated here - a requisition's
 * tests are com.pms.billing.entity.BillingItem rows (e.g. under a "Lab
 * Tests" category), invoiced through the existing generic Invoice flow, the
 * same way CT/Xray tests are just a LabCategory variant in the legacy app.
 */
@Entity
@Table(name = "lab_requisition")
@Getter
@Setter
@NoArgsConstructor
public class LabRequisition extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "requisition_number", nullable = false, unique = true)
    private String requisitionNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private RequisitionStatus status = RequisitionStatus.ORDERED;

    private String notes;

    @OneToMany(mappedBy = "requisition", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<LabRequisitionItem> items = new ArrayList<>();
}
