package com.pms.icd.entity;

import com.pms.common.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The ICD Code Master (migration doc-style vertical slice, same shape as
 * Department/Consultant): one row per diagnosis code, versioned ICD-10 vs
 * ICD-11 since the two catalogs use overlapping code strings.
 */
@Entity
@Table(name = "icd_code")
@Getter
@Setter
@NoArgsConstructor
public class IcdCode extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private IcdVersion version;

    @Column(nullable = false, length = 20)
    private String code;

    @Column(name = "disease_name", nullable = false)
    private String diseaseName;

    private String chapter;

    private String category;

    @Column(name = "who_version")
    private String whoVersion;

    @Column(name = "short_description", columnDefinition = "TEXT")
    private String shortDescription;

    @Column(nullable = false)
    private boolean active = true;
}
