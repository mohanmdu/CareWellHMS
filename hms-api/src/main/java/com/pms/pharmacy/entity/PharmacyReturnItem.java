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
 * One returned line within a PharmacyReturn header, against a specific
 * PharmacySaleItem. amount/sgstAmount/cgstAmount/netAmount are computed
 * proportionally to the returned quantity out of the original sold quantity
 * (see PharmacyReturnService.create) - GST is refunded, not just the base
 * amount.
 */
@Entity
@Table(name = "pharmacy_return_item")
@Getter
@Setter
@NoArgsConstructor
public class PharmacyReturnItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "return_id", nullable = false)
    private PharmacyReturn pharmacyReturn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_item_id", nullable = false)
    private PharmacySaleItem saleItem;

    @Column(name = "product_name", nullable = false)
    private String productName;

    private String batch;

    private Double mrp;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "sgst_percent")
    private Double sgstPercent;

    @Column(name = "sgst_amount", nullable = false)
    private Double sgstAmount = 0.0;

    @Column(name = "cgst_percent")
    private Double cgstPercent;

    @Column(name = "cgst_amount", nullable = false)
    private Double cgstAmount = 0.0;

    @Column(name = "net_amount", nullable = false)
    private Double netAmount = 0.0;
}
