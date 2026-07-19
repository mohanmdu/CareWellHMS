package com.pms.cms.dto;

import com.pms.cms.entity.CmsGalleryItemType;
import jakarta.validation.constraints.NotNull;

public record CmsGalleryItemDto(
        Long id, @NotNull CmsGalleryItemType type, String title, String mediaPathOrUrl, String album, Boolean active) {
}
