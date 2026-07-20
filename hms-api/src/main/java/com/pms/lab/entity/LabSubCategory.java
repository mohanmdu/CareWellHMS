package com.pms.lab.entity;

import com.pms.common.Auditable;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Middle level of the Lab & Investigations master hierarchy, scoped to one LabCategory. */
@Entity
@Table(name = "lab_sub_category")
@Getter
@Setter
@NoArgsConstructor
public class LabSubCategory extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private LabCategory category;

    @Column(nullable = false)
    private String name;

    @Column(name = "op_amount", nullable = false)
    private double opAmount;

    @Column(name = "ip_amount", nullable = false)
    private double ipAmount;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "ordering_no", nullable = false)
    private int orderingNo;

    private String heading;

    @OneToMany(mappedBy = "subCategory", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orderingNo ASC")
    private List<LabComponent> components = new ArrayList<>();
}
