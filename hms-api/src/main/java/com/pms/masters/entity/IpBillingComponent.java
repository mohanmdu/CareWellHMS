package com.pms.masters.entity;

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
 * A priced IP Billing line item template under an IpBillingCategory - mirrors
 * OpBillingComponent, but with separate Cash (ipAmount) and Insurance
 * (insuranceAmount) prices per the legacy IP Billing Component screen.
 */
@Entity
@Table(name = "ip_billing_component")
@Getter
@Setter
@NoArgsConstructor
public class IpBillingComponent extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private IpBillingCategory category;

    @Column(nullable = false)
    private String name;

    @Column(name = "ip_amount", nullable = false)
    private Double ipAmount;

    @Column(name = "insurance_amount", nullable = false)
    private Double insuranceAmount;

    @Column(nullable = false)
    private boolean active = true;
}
