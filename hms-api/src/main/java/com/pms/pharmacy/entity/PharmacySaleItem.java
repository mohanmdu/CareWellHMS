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
 * One sold line on a PharmacySale, sold against a specific PharmacyStock
 * batch (which gets decremented - see PharmacyStockService.decrement).
 * Fields are snapshotted at sale time, same reasoning as every other item
 * table in this codebase.
 */
@Entity
@Table(name = "pharmacy_sale_item")
@Getter
@Setter
@NoArgsConstructor
public class PharmacySaleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id", nullable = false)
    private PharmacySale sale;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private PharmacyStock stock;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "product_type_name")
    private String productTypeName;

    private String batch;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    private Double mrp;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Double amount;

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

    @Column(name = "net_amount", nullable = false)
    private Double netAmount = 0.0;
}
