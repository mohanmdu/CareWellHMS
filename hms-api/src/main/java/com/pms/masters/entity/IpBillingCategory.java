package com.pms.masters.entity;

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

/** IP Billing category (e.g. "Baby Care", "ICU Charges") - groups IpBillingComponent line items, mirroring OpBillingCategory. */
@Entity
@Table(name = "ip_billing_category")
@Getter
@Setter
@NoArgsConstructor
public class IpBillingCategory extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private boolean active = true;
}
