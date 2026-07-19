package com.pms.ipbilling.entity;

import com.pms.common.Auditable;
import com.pms.ipadmission.entity.Admission;
import com.pms.masters.entity.Consultant;
import com.pms.masters.entity.IpBillingCategory;
import com.pms.masters.entity.IpBillingComponent;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One billed charge on the Patient Billing Advice / BILLING ledger (PDF
 * p.11-12) - e.g. an OT Charges component billed against a consultant.
 * Ward/Bed Charges is computed separately from the admission's room rate and
 * stay length, not stored as a line item here.
 */
@Entity
@Table(name = "ip_billing_line_item")
@Getter
@Setter
@NoArgsConstructor
public class IpBillingLineItem extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admission_id", nullable = false)
    private Admission admission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private IpBillingCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultant_id")
    private Consultant consultant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "component_id", nullable = false)
    private IpBillingComponent component;

    @Column
    private String remarks;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "unit_amount", nullable = false)
    private double unitAmount;

    @Column
    private String units;

    @Column(name = "line_total", nullable = false)
    private double lineTotal;

    @Column(name = "discount_amount", nullable = false)
    private double discountAmount = 0;

    @Column(name = "refund_amount", nullable = false)
    private double refundAmount = 0;

    @Column(name = "discount_reason")
    private String discountReason;

    @Column(name = "requested_on", nullable = false)
    private Instant requestedOn;

    @Column(name = "created_by")
    private String createdBy;
}
