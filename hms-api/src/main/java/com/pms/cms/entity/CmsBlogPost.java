package com.pms.cms.entity;

import com.pms.common.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A blog article on the public website, addressable by its unique slug. */
@Entity
@Table(name = "cms_blog_post")
@Getter
@Setter
@NoArgsConstructor
public class CmsBlogPost extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(name = "cover_image_path")
    private String coverImagePath;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(nullable = false)
    private boolean active = true;
}
