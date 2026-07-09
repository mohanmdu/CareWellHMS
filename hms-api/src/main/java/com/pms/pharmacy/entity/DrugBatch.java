package com.pms.pharmacy.entity;

import com.pms.common.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Replaces the legacy com.pms.model.Pharmacy_ProductDetails (batch/expiry
 * stock rows). Carries an optimistic-lock @Version and a DB-level
 * CHECK(quantity_on_hand >= 0) constraint (see V6 migration) specifically
 * to close the migration doc's risk R10 - the legacy stock decrement was a
 * raw unlocked HQL bulk UPDATE that allowed overselling under concurrent
 * dispensing. Do not remove @Version when refactoring this class.
 */
@Entity
@Table(name = "drug_batch")
@Getter
@Setter
@NoArgsConstructor
public class DrugBatch extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drug_id", nullable = false)
    private Drug drug;

    @Column(name = "batch_number", nullable = false)
    private String batchNumber;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "quantity_on_hand", nullable = false)
    private int quantityOnHand;

    @Column(name = "purchase_price", nullable = false)
    private double purchasePrice;

    @Column(name = "selling_price", nullable = false)
    private double sellingPrice;

    @Version
    private long version;
}
