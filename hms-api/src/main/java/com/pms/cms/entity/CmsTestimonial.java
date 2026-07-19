package com.pms.cms.entity;

import com.pms.common.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A patient testimonial on the public website. */
@Entity
@Table(name = "cms_testimonial")
@Getter
@Setter
@NoArgsConstructor
public class CmsTestimonial extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String quote;

    private Integer rating;

    @Column(name = "photo_path")
    private String photoPath;

    @Column(nullable = false)
    private boolean active = true;
}
