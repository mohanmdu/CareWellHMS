package com.pms.lab.entity;

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
 * One line item on a requisition - either a selected Lab test (a
 * LabSubCategory, the "Labtest" flow) or an ad-hoc billing line sourced from
 * the existing OP Billing Catalog (the "Billing"/Investigations flow, which
 * has no Lab sub-category to reference - see LabRequisitionService.create()).
 * Category/sub-category names and the amount are always snapshotted at
 * requisition time so the receipt stays accurate even if the source
 * master's price or name changes later.
 */
@Entity
@Table(name = "lab_requisition_item")
@Getter
@Setter
@NoArgsConstructor
public class LabRequisitionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisition_id", nullable = false)
    private LabRequisition requisition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_category_id")
    private LabSubCategory subCategory;

    @Column(name = "category_name", nullable = false)
    private String categoryName;

    @Column(name = "sub_category_name", nullable = false)
    private String subCategoryName;

    @Column(nullable = false)
    private double amount;
}
