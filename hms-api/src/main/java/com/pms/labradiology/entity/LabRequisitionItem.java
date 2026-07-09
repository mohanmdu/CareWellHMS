package com.pms.labradiology.entity;

import com.pms.billing.entity.BillingItem;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
    @JoinColumn(name = "billing_item_id", nullable = false)
    private BillingItem test;

    @Column(name = "specimen_type")
    private String specimenType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private RequisitionItemStatus status = RequisitionItemStatus.PENDING;

    @Column(name = "result_value")
    private String resultValue;

    @Column(name = "normal_range")
    private String normalRange;
}
