package com.pms.cms.entity;

import com.pms.common.Auditable;
import com.pms.masters.entity.Department;
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

/** A job opening on the public website's careers page. Department is optional. */
@Entity
@Table(name = "cms_career_opening")
@Getter
@Setter
@NoArgsConstructor
public class CmsCareerOpening extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "apply_email")
    private String applyEmail;

    @Column(nullable = false)
    private boolean active = true;
}
