package com.pms.registration.entity;

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

/** One drug line in an OpCaseSheet's Pharmacy Prescription grid. */
@Entity
@Table(name = "op_prescription_item")
@Getter
@Setter
@NoArgsConstructor
public class OpPrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_sheet_id", nullable = false)
    private OpCaseSheet caseSheet;

    @Column(name = "drug_name", nullable = false)
    private String drugName;

    private Integer qty;

    @Column(length = 100)
    private String intake;

    @Column(name = "morning_dose")
    private Integer morningDose;

    @Column(name = "afternoon_dose")
    private Integer afternoonDose;

    @Column(name = "evening_dose")
    private Integer eveningDose;

    @Column(name = "night_dose")
    private Integer nightDose;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;
}
