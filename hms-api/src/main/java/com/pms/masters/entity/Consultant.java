package com.pms.masters.entity;

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
 * Replaces the legacy com.pms.model.Consultant (table consultant). The legacy
 * entity stored the department as a free-text name/code (CONSLT_DEPT,
 * CONSLT_DEPT_NAME); this modernized version uses a real foreign key to
 * Department instead, and drops the slot/session-timing fields that belong
 * to the Appointments module (Phase 2 order 2), not master data - see
 * migration doc §4.6 and §5.
 */
@Entity
@Table(name = "consultant")
@Getter
@Setter
@NoArgsConstructor
public class Consultant extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column
    private String specialization;

    @Column
    private String email;

    @Column
    private String mobileNumber;

    @Column(name = "consultation_fee")
    private double consultationFee;

    @Column(nullable = false)
    private boolean active = true;
}
