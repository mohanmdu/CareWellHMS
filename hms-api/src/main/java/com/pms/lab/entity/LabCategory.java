package com.pms.lab.entity;

import com.pms.common.Auditable;
import com.pms.masters.entity.RevenueBucket;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Top level of the Lab & Investigations master hierarchy (Category -> Sub-Category -> Component). */
@Entity
@Table(name = "lab_category")
@Getter
@Setter
@NoArgsConstructor
public class LabCategory extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "op_amount", nullable = false)
    private double opAmount;

    @Column(name = "ip_amount", nullable = false)
    private double ipAmount;

    @Column(name = "ordering_no", nullable = false)
    private int orderingNo;

    /** Which CEO/MD Dashboard revenue slice this category rolls up into - see RevenueBucket. Typically LAB or RADIOLOGY. */
    @Enumerated(EnumType.STRING)
    @Column(name = "revenue_bucket", nullable = false)
    private RevenueBucket revenueBucket = RevenueBucket.LAB;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orderingNo ASC")
    private List<LabSubCategory> subCategories = new ArrayList<>();
}
