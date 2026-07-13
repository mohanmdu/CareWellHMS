package com.pms.registration.entity;

import com.pms.common.Auditable;
import com.pms.masters.entity.Consultant;
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
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Replaces the legacy AppntReqt/AppointLog pair and the ~10 near-duplicate
 * AdminAction cancel methods (cancelAppnt, reqCancelApp, reqCancelApp1,
 * reqCancelPat*, Advancecancel, canceladmision - see migration doc §4.1)
 * with one entity and one explicit AppointmentStatus state machine.
 */
@Entity
@Table(name = "appointment")
@Getter
@Setter
@NoArgsConstructor
public class Appointment extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultant_id", nullable = false)
    private Consultant consultant;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "slot_time", nullable = false)
    private LocalTime slotTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private AppointmentStatus status = AppointmentStatus.BOOKED;

    private String notes;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Enumerated(EnumType.STRING)
    @Column(name = "cancelled_by", length = 16)
    private CancelledBy cancelledBy;

    // Set together by AppointmentService.bill() when approving moves straight
    // to COMPLETED (see migration doc for the approval-time billing flow).
    @Column(name = "paid_amount")
    private Double paidAmount;

    @Column(name = "discount_amount")
    private Double discountAmount;

    @Column(name = "doctor_referral_amount")
    private Double doctorReferralAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", length = 32)
    private PaymentMode paymentMode;

    @Column(name = "billing_remarks", length = 500)
    private String billingRemarks;

    @Column(name = "billed_at")
    private Instant billedAt;

    @Column(name = "invoice_number")
    private Long invoiceNumber;

    @Column(name = "billed_by", length = 100)
    private String billedBy;

    // Reserved for a future refund flow - nothing writes a non-null/non-zero
    // value here yet, but the Collection Report already has a column for it.
    @Column(name = "refund_amount")
    private Double refundAmount;
}
