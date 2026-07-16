package com.pms.pharmacy.entity;

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
 * A single Internal Receipt or Stock Adjustment against an existing
 * PharmacyStock batch - unified under transactionType, matching the legacy
 * single screen with a "Select Return Type" selector. Location is
 * descriptive metadata only (see PharmacyStock's class doc) - applying one
 * of these calls PharmacyStockService.adjust(stockId, delta), never touches
 * quantityOnHand directly.
 */
@Entity
@Table(name = "pharmacy_stock_transaction")
@Getter
@Setter
@NoArgsConstructor
public class PharmacyStockTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private PharmacyStock stock;

    @Column(name = "product_name", nullable = false)
    private String productName;

    private String batch;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20)
    private PharmacyStockTransactionType transactionType;

    // Signed - Internal Receipt is always positive; Stock Adjustment may be negative.
    @Column(nullable = false)
    private Integer quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private PharmacyLocation location;

    private String reason;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
