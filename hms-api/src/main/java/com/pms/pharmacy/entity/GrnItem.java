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
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One received product line on a Grn. productName/productTypeName/hsnSac are
 * snapshotted at receipt time (same reasoning as PurchaseOrderItem) - hsnSac
 * defaults from Product Master but stays independently editable per row
 * since the legacy form allows manual entry when the product has none set.
 * netValue is computed server-side: purchaseRate*totalQty - discountAmount +
 * sgstAmount + cgstAmount.
 */
@Entity
@Table(name = "grn_item")
@Getter
@Setter
@NoArgsConstructor
public class GrnItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grn_id", nullable = false)
    private Grn grn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "product_type_name")
    private String productTypeName;

    @Column(nullable = false)
    private Integer packing = 1;

    @Column(nullable = false)
    private Integer qty;

    @Column(name = "total_qty", nullable = false)
    private Integer totalQty;

    @Column(name = "free_qty", nullable = false)
    private Integer freeQty = 0;

    private String batch;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "manufacture_date")
    private LocalDate manufactureDate;

    private Double mrp;

    @Column(name = "purchase_rate", nullable = false)
    private Double purchaseRate;

    @Column(name = "discount_percent")
    private Double discountPercent;

    @Column(name = "discount_amount")
    private Double discountAmount;

    @Column(name = "hsn_sac")
    private String hsnSac;

    @Column(name = "sgst_percent")
    private Double sgstPercent;

    @Column(name = "sgst_amount", nullable = false)
    private Double sgstAmount = 0.0;

    @Column(name = "cgst_percent")
    private Double cgstPercent;

    @Column(name = "cgst_amount", nullable = false)
    private Double cgstAmount = 0.0;

    @Column(name = "net_value", nullable = false)
    private Double netValue = 0.0;
}
