package com.pms.billing.entity;

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
 * Replaces the legacy com.pms.model.OPBillingCategory (migration doc §4.1,
 * §4.6 - same generic category/sub-category/component master pattern
 * repeated in Lab/IP/HRMS categories).
 */
@Entity
@Table(name = "billing_category")
@Getter
@Setter
@NoArgsConstructor
public class BillingCategory extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private boolean active = true;
}
