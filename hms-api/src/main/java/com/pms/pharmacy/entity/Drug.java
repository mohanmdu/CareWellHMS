package com.pms.pharmacy.entity;

import com.pms.common.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Replaces the legacy com.pms.model.Pharmacy_ProductMaster / DrugMasterInfo
 * (migration doc §4.3). Batch/expiry/pricing live on DrugBatch, not here -
 * the legacy schema mixed master data and batch stock in overlapping
 * tables (Pharmacy_ProductMaster / Pharmacy_ProductDetails).
 */
@Entity
@Table(name = "drug")
@Getter
@Setter
@NoArgsConstructor
public class Drug extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "generic_name")
    private String genericName;

    private String manufacturer;

    @Column(name = "unit_of_measure")
    private String unitOfMeasure;

    @Column(nullable = false)
    private boolean active = true;
}
