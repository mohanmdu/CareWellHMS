package com.pms.lab.entity;

import com.pms.common.Auditable;
import com.pms.ipadmission.entity.Admission;
import com.pms.masters.entity.Consultant;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A Lab Test requisition: created against the Lab & Investigations masters
 * (Category/Sub-Category), goes through the same two-stage
 * pending-then-billed flow as Appointment/OP Direct Billing (see
 * InvoiceNumberService, which this shares a sequence with).
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

    /** "Labtest" (Lab Sub-Category items) or "Billing" (ad-hoc OP-Billing-Catalog items - the Investigations flow) - set in LabRequisitionService.create(). */
    @Column(name = "requisition_type", nullable = false)
    private String requisitionType = "Labtest";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    /**
     * The patient's currently-active (ADMITTED) admission at the moment this
     * requisition was created, if any - lets IP Billing pull this charge into
     * that specific admission's ledger. Null for OP requisitions. Set once at
     * creation (LabRequisitionService.create()); independent of the separate
     * patientType heuristic below, which only affects OP/IP pricing.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admission_id")
    private Admission admission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultant_id")
    private Consultant consultant;

    /** Computed at creation from the patient's most recent Appointment vs Admission - "OP" or "IP". */
    @Column(name = "patient_type")
    private String patientType;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_type", nullable = false, length = 16)
    private LabBillingType billingType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private LabRequisitionStatus status = LabRequisitionStatus.PENDING;

    @Column(name = "total_amount", nullable = false)
    private double totalAmount;

    @Column(name = "requisition_date", nullable = false)
    private LocalDateTime requisitionDate;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "invoice_number")
    private Long invoiceNumber;

    @Column(name = "paid_amount")
    private Double paidAmount;

    @Column(name = "discount_amount")
    private Double discountAmount;

    /** Stamped by LabRefundService.create() - kept on the requisition itself (not just the LabRefund row) so Collection Report totals need no extra join. */
    @Column(name = "refund_amount")
    private Double refundAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", length = 32)
    private LabPaymentMode paymentMode;

    @Column(length = 500)
    private String remarks;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancelled_by")
    private String cancelledBy;

    @OneToMany(mappedBy = "requisition", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<LabRequisitionItem> items = new ArrayList<>();
}
