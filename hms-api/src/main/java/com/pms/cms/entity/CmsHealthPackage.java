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

/** A published health/checkup package shown on the public website. */
@Entity
@Table(name = "cms_health_package")
@Getter
@Setter
@NoArgsConstructor
public class CmsHealthPackage extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private double price;

    @Column(name = "includes_text", columnDefinition = "TEXT")
    private String includes;

    @Column(nullable = false)
    private boolean active = true;
}
