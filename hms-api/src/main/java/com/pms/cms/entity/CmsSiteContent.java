package com.pms.cms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Singleton (id always 1, seeded by V40) homepage/about content for the
 * optional public website - same shape as ClinicSettings: one row, edited in
 * place, no history needed.
 */
@Entity
@Table(name = "cms_site_content")
@Getter
@Setter
@NoArgsConstructor
public class CmsSiteContent {

    public static final Long SINGLETON_ID = 1L;

    @Id
    private Long id = SINGLETON_ID;

    @Column(name = "about_us_body", columnDefinition = "TEXT")
    private String aboutUsBody;

    @Column(name = "mission_body", columnDefinition = "TEXT")
    private String missionBody;

    @Column(name = "vision_body", columnDefinition = "TEXT")
    private String visionBody;

    @Column(name = "home_intro_title")
    private String homeIntroTitle;

    @Column(name = "home_intro_body", columnDefinition = "TEXT")
    private String homeIntroBody;
}
