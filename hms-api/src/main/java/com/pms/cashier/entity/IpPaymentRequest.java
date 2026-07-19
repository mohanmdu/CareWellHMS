package com.pms.cashier.entity;

import com.pms.common.Auditable;
import com.pms.ipadmission.entity.Admission;
import com.pms.ipbilling.entity.IpPayment;
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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Cashier Approval Workflow request (PDF: Patient IP Details -> Success banner
 * -> Cashier Dashboard -> IP Approval Queue -> Payment Mode Selection ->
 * Advance Receipt). Raised from the billing page's "Amount Received" action,
 * queued PENDING until a cashier picks a payment mode and approves it, at
 * which point an IpPayment ledger row is created and linked back here.
 */
@Entity
@Table(name = "ip_payment_request")
@Getter
@Setter
@NoArgsConstructor
public class IpPaymentRequest extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admission_id", nullable = false)
    private Admission admission;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false, length = 32)
    private PaymentRequestType requestType;

    @Column(nullable = false)
    private double amount;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PaymentRequestStatus status = PaymentRequestStatus.PENDING;

    @Column(name = "payment_mode")
    private String paymentMode;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt;

    @Column(name = "requested_by")
    private String requestedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "approved_by")
    private String approvedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ip_payment_id")
    private IpPayment ipPayment;
}
