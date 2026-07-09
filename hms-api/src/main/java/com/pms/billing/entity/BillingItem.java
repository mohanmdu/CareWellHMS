package com.pms.billing.entity;

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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Replaces the legacy com.pms.model.OPBillingComponent - a priced,
 * chargeable line item under a BillingCategory (migration doc §4.1).
 */
@Entity
@Table(name = "billing_item")
@Getter
@Setter
@NoArgsConstructor
public class BillingItem extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billing_category_id", nullable = false)
    private BillingCategory category;

    @Column(nullable = false)
    private double price;

    @Column(nullable = false)
    private boolean active = true;
}
