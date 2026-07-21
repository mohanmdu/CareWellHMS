package com.pms.lab.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A single refund transaction against a billed (APPROVED) LabRequisition -
 * mirrors com.pms.registration.entity.Refund's single-source shape (Lab has
 * only one billing source, so no RefundSource branching is needed). Exactly
 * one refund per requisition, enforced by uq_lab_refund_requisition - the
 * legacy flow only ever does a single approve-then-confirm pass per invoice,
 * not a running refund history.
 */
@Entity
@Table(name = "lab_refund")
@Getter
@Setter
@NoArgsConstructor
public class LabRefund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "requisition_id", nullable = false)
    private LabRequisition requisition;

    @Column(name = "refund_number", nullable = false)
    private Long refundNumber;

    @Column(name = "refund_amount", nullable = false)
    private Double refundAmount;

    @Column(length = 500)
    private String reason;

    @Column(name = "refunded_by", length = 100)
    private String refundedBy;

    @Column(name = "refunded_at", nullable = false)
    private LocalDateTime refundedAt;
}
