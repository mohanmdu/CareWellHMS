package com.pms.lab.entity;

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
 * Leaf level of the Lab & Investigations master hierarchy: one measurable
 * test parameter under a LabSubCategory (its LabCategory is reached via
 * subCategory.getCategory(), not duplicated here).
 */
@Entity
@Table(name = "lab_component")
@Getter
@Setter
@NoArgsConstructor
public class LabComponent extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_category_id", nullable = false)
    private LabSubCategory subCategory;

    @Column(nullable = false)
    private String name;

    @Column(name = "field_type")
    private String fieldType;

    @Column(name = "sample_type")
    private String sampleType;

    private String method;

    @Column(name = "male_range_from")
    private String maleRangeFrom;

    @Column(name = "male_range_to")
    private String maleRangeTo;

    @Column(name = "female_range_from")
    private String femaleRangeFrom;

    @Column(name = "female_range_to")
    private String femaleRangeTo;

    @Column(name = "normal_range", columnDefinition = "TEXT")
    private String normalRange;

    private String units;

    @Column(name = "ordering_no", nullable = false)
    private int orderingNo;

    @Column(name = "component_heading")
    private String componentHeading;

    @Column(name = "conventional_factor")
    private String conventionalFactor;

    @Column(name = "si_unit")
    private String siUnit;
}
