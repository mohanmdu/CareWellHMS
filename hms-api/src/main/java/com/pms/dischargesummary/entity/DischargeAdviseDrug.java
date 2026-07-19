package com.pms.dischargesummary.entity;

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

/** One row of the "Advise Drug" prescription table on the Discharge Summary. */
@Entity
@Table(name = "discharge_advise_drug")
@Getter
@Setter
@NoArgsConstructor
public class DischargeAdviseDrug {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discharge_summary_id", nullable = false)
    private DischargeSummary dischargeSummary;

    @Column(name = "drug_name", nullable = false)
    private String drugName;

    @Enumerated(EnumType.STRING)
    @Column(name = "advise_type", nullable = false, length = 16)
    private AdviseType adviseType = AdviseType.REGULAR;

    private String dose;
    private String morning;
    private String afternoon;
    private String evening;
    private String night;
    private String route;

    @Column(name = "relationship_with_meal")
    private String relationshipWithMeal;

    private String duration;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}
