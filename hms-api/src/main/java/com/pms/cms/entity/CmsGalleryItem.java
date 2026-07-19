package com.pms.cms.entity;

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
 * A gallery photo or video on the public website. For PHOTO items,
 * mediaPathOrUrl is set via the image-upload endpoint; for VIDEO items it is
 * a plain external URL (YouTube/Vimeo) submitted directly.
 */
@Entity
@Table(name = "cms_gallery_item")
@Getter
@Setter
@NoArgsConstructor
public class CmsGalleryItem extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private CmsGalleryItemType type;

    private String title;

    @Column(name = "media_path_or_url")
    private String mediaPathOrUrl;

    private String album;

    @Column(nullable = false)
    private boolean active = true;
}
