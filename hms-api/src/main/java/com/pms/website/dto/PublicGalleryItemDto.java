package com.pms.website.dto;

import com.pms.cms.entity.CmsGalleryItemType;

/** Public-safe projection of CmsGalleryItem - Gallery/Videos pages. */
public record PublicGalleryItemDto(
        Long id,
        CmsGalleryItemType type,
        String title,
        String mediaUrl,
        String album) {
}
