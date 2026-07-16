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
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Purchase Return header - single-step (immediate), unlike PharmacyReturn's
 * PENDING/APPROVED workflow: no separate approval module was requested for
 * this one. Confirming decrements PharmacyStock immediately (see
 * PharmacyPurchaseReturnService) - there is no pending state.
 */
@Entity
@Table(name = "pharmacy_purchase_return")
@Getter
@Setter
@NoArgsConstructor
public class PharmacyPurchaseReturn extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Enumerated(EnumType.STRING)
    @Column(name = "return_type", nullable = false, length = 20)
    private PharmacyPurchaseReturnType returnType;

    @Column(length = 500)
    private String remarks;

    // Computed server-side from the sum of item netAmounts - never accepted from the client.
    @Column(name = "total_amount", nullable = false)
    private Double totalAmount = 0.0;

    @Column(name = "returned_by", length = 100)
    private String returnedBy;

    @OneToMany(mappedBy = "purchaseReturn", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    private List<PharmacyPurchaseReturnItem> items = new ArrayList<>();
}
