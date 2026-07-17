package com.pms.ipadmission.entity;

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

/** Replaces the legacy com.pms.model.RoomTypes (migration doc §4.2). */
@Entity
@Table(name = "room_type")
@Getter
@Setter
@NoArgsConstructor
public class RoomType extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "rent_cash", nullable = false)
    private double rentCash;

    @Column(name = "rent_claim", nullable = false)
    private double rentClaim;

    @Column(nullable = false)
    private boolean active = true;
}
