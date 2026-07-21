package com.pms.insurance.entity;

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

/**
 * Insurance Company Master - the source list for the "Insurance Company"/
 * "Select Company" fields used across the Insurance module (IP Admission's
 * Insurance Company field, Claim Report, Rejected Report). insuranceType is
 * free text (Direct Insurance/Private TPA/Govt Insurance/Corporate Name/TPA
 * Name), matching Admission.insuranceType's existing free-text convention.
 */
@Entity
@Table(name = "insurance_company")
@Getter
@Setter
@NoArgsConstructor
public class InsuranceCompany extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "insurance_type", nullable = false, length = 50)
    private String insuranceType;

    @Column(name = "company_name", nullable = false, unique = true)
    private String companyName;

    @Column(nullable = false)
    private boolean active = true;
}
