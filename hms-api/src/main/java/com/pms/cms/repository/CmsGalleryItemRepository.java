package com.pms.cms.repository;

import com.pms.cms.entity.CmsGalleryItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CmsGalleryItemRepository extends JpaRepository<CmsGalleryItem, Long> {
    List<CmsGalleryItem> findByActiveTrueOrderByCreatedAtDesc();

    List<CmsGalleryItem> findByActiveFalseOrderByUpdatedAtDesc();
}
