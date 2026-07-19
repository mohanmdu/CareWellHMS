package com.pms.masters.entity;

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
 * Reference vertical slice for the master/detail CRUD pattern (§5 of the migration doc)
 * that repeats across Departments, Consultants, Lab/IP/HRMS categories, etc. in the
 * legacy app. New master entities should follow this same entity/repository/service/
 * controller shape rather than duplicating it by hand per module.
 */
@Entity
@Table(name = "department")
@Getter
@Setter
@NoArgsConstructor
public class Department extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "published_to_web", nullable = false)
    private boolean publishedToWeb = false;
}
