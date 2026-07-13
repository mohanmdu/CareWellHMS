package com.pms.registration.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A single refund transaction against a billed (COMPLETED) appointment OR
 * an OP Direct Billing invoice - see migration doc's "Payment Refund"
 * screens. Exactly one of appointment/opDirectBilling is set (enforced by
 * chk_refund_source) - the legacy flow only ever does a single
 * approve-then-confirm pass per invoice, not a running refund history, so
 * each is also individually unique (uq_refund_appointment / uq_refund_op_direct_billing).
 */
@Entity
@Table(name = "refund")
@Getter
@Setter
@NoArgsConstructor
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @OneToOne
    @JoinColumn(name = "op_direct_billing_id")
    private OpDirectBilling opDirectBilling;

    @Column(name = "refund_number", nullable = false)
    private Long refundNumber;

    @Column(name = "refund_amount", nullable = false)
    private Double refundAmount;

    @Column(length = 500)
    private String reason;

    @Column(name = "refunded_by", length = 100)
    private String refundedBy;

    @Column(name = "refunded_at", nullable = false)
    private Instant refundedAt;
}
