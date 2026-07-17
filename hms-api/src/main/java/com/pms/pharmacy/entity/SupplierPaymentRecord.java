package com.pms.pharmacy.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
 * One payment ledger entry against a single Grn invoice - track-only (no
 * real payment gateway, matching this app's posture everywhere else). Paid
 * Amount/Balance Amount at every level (vendor, invoice) are computed live
 * as invoiceAmount minus SUM(these rows for that Grn), never stored
 * redundantly on Grn itself.
 */
@Entity
@Table(name = "pharmacy_supplier_payment")
@Getter
@Setter
@NoArgsConstructor
public class SupplierPaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grn_id", nullable = false)
    private Grn grn;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "pay_mode", nullable = false, length = 20)
    private String payMode;

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(length = 500)
    private String remarks;

    @Column(name = "paid_by", length = 100)
    private String paidBy;

    @Column(name = "paid_at", nullable = false)
    private Instant paidAt;
}
