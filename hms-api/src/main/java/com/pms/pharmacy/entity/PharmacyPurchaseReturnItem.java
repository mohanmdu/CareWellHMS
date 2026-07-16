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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One returned line within a PharmacyPurchaseReturn header, against a
 * specific PharmacyStock batch. Snapshotted at return time, same reasoning
 * as every other item table in this codebase.
 */
@Entity
@Table(name = "pharmacy_purchase_return_item")
@Getter
@Setter
@NoArgsConstructor
public class PharmacyPurchaseReturnItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_return_id", nullable = false)
    private PharmacyPurchaseReturn purchaseReturn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private PharmacyStock stock;

    @Column(name = "product_name", nullable = false)
    private String productName;

    private String batch;

    private Double mrp;

    @Column(name = "purchase_rate")
    private Double purchaseRate;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "net_amount", nullable = false)
    private Double netAmount = 0.0;
}
