package com.pms.cms.entity;

import com.pms.common.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A news article or event on the public website. eventDate is set only for actual events. */
@Entity
@Table(name = "cms_news_event")
@Getter
@Setter
@NoArgsConstructor
public class CmsNewsEvent extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(name = "event_date")
    private LocalDate eventDate;

    @Column(name = "cover_image_path")
    private String coverImagePath;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(nullable = false)
    private boolean active = true;
}
