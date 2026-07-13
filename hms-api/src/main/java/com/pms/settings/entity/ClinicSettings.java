package com.pms.settings.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Singleton (id always 1, seeded by V18) hospital branding used on printed
 * receipts - this product deploys to multiple hospital clients, so the name/
 * address/logo shown on a receipt must be admin-editable per deployment
 * rather than hardcoded in the frontend template.
 */
@Entity
@Table(name = "clinic_settings")
@Getter
@Setter
@NoArgsConstructor
public class ClinicSettings {

    public static final Long SINGLETON_ID = 1L;

    @Id
    private Long id = SINGLETON_ID;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String address;

    @Column(length = 64)
    private String phone;

    private String email;

    @Column(name = "logo_path")
    private String logoPath;
}
