package com.pms.pharmacy.entity;

import com.pms.common.Auditable;
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
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Header for a Sales Return submitted against one PharmacySale invoice - one
 * "Approve Return" submission can cover several PharmacyReturnItem lines.
 * Submitting only persists PENDING (no stock movement yet); a separate
 * approval step (PharmacyReturnService.approve) is what credits
 * PharmacyStock back and flips status to APPROVED - see PharmacyReturnService
 * for the full two-step workflow.
 */
@Entity
@Table(name = "pharmacy_return")
@Getter
@Setter
@NoArgsConstructor
public class PharmacyReturn extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id", nullable = false)
    private PharmacySale sale;

    @Enumerated(EnumType.STRING)
    @Column(name = "return_type", nullable = false, length = 10)
    private PharmacyReturnType returnType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PharmacyReturnStatus status = PharmacyReturnStatus.PENDING;

    // Computed server-side from the sum of item netAmounts - never accepted from the client.
    @Column(name = "total_amount", nullable = false)
    private Double totalAmount = 0.0;

    @Column(length = 500)
    private String remarks;

    @Column(name = "submitted_by", length = 100)
    private String submittedBy;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @OneToMany(mappedBy = "pharmacyReturn", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    private List<PharmacyReturnItem> items = new ArrayList<>();
}
