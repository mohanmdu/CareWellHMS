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

    @Column(name = "tin_no", length = 50)
    private String tinNo;

    @Column(name = "dl_no", length = 50)
    private String dlNo;

    @Column(name = "website_enabled", nullable = false)
    private boolean websiteEnabled = false;

    private String domain;

    @Column(name = "theme_primary_color", length = 9)
    private String themePrimaryColor;

    @Column(name = "theme_secondary_color", length = 9)
    private String themeSecondaryColor;

    @Column(name = "favicon_path")
    private String faviconPath;

    @Column(name = "seo_default_title")
    private String seoDefaultTitle;

    @Column(name = "seo_default_description", length = 500)
    private String seoDefaultDescription;

    @Column(name = "social_facebook_url")
    private String socialFacebookUrl;

    @Column(name = "social_instagram_url")
    private String socialInstagramUrl;

    @Column(name = "social_youtube_url")
    private String socialYoutubeUrl;

    @Column(name = "whatsapp_number", length = 20)
    private String whatsappNumber;
}
