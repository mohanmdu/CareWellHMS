package com.pms.dischargesummary.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One surgery/procedure entry under a Discharge Summary. The reference form
 * shows this as 3 hand-copied fixed blocks (Procedure Name / Procedure Name II
 * / Procedure2, Procedure3); modeled here as one repeatable line-item list
 * instead, matching the Advise Drug table's Add/Remove pattern rather than
 * duplicating markup three times for the same shape.
 */
@Entity
@Table(name = "discharge_surgery_procedure")
@Getter
@Setter
@NoArgsConstructor
public class DischargeSurgeryProcedure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discharge_summary_id", nullable = false)
    private DischargeSummary dischargeSummary;

    @Column(name = "procedure_name")
    private String procedureName;

    @Column(name = "surgeon_name")
    private String surgeonName;

    @Column(name = "assistant_surgeon_name")
    private String assistantSurgeonName;

    @Column(name = "anaesthetist_name")
    private String anaesthetistName;

    @Column(name = "date_of_surgery")
    private LocalDate dateOfSurgery;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}
