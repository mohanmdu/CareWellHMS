package com.pms.website.service;

import com.pms.cms.entity.CmsGalleryItemType;
import com.pms.cms.repository.CmsGalleryItemRepository;
import com.pms.website.dto.PublicGalleryItemDto;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reads CmsGalleryItemRepository directly (not through CmsGalleryItemService)
 * so the public projection stays a narrow, deliberate facade, same idiom as
 * PublicConfigService/PublicDepartmentService. No repository finder exists
 * for the optional type filter, so it's applied in-memory (mirrors
 * PublicConsultantService's departmentId filter).
 */
@Service
@Transactional(readOnly = true)
public class PublicGalleryItemService {

    private final CmsGalleryItemRepository repository;

    public PublicGalleryItemService(CmsGalleryItemRepository repository) {
        this.repository = repository;
    }

    public List<PublicGalleryItemDto> list(CmsGalleryItemType type) {
        return repository.findByActiveTrueOrderByCreatedAtDesc().stream()
                .filter(item -> type == null || type == item.getType())
                .map(item -> new PublicGalleryItemDto(
                        item.getId(),
                        item.getType(),
                        item.getTitle(),
                        item.getMediaPathOrUrl(),
                        item.getAlbum()))
                .toList();
    }
}
