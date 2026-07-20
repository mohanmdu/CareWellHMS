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

/** One measurable result row (a LabComponent) under a LabTestEntry. */
@Entity
@Table(name = "lab_test_result")
@Getter
@Setter
@NoArgsConstructor
public class LabTestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_test_entry_id", nullable = false)
    private LabTestEntry labTestEntry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "component_id", nullable = false)
    private LabComponent component;

    @Column(name = "result_value")
    private String resultValue;

    @Column(nullable = false)
    private boolean abnormal = false;
}
