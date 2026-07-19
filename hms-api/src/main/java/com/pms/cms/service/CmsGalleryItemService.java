package com.pms.cms.service;

import com.pms.cms.dto.CmsGalleryItemDto;
import com.pms.cms.entity.CmsGalleryItem;
import com.pms.cms.entity.CmsGalleryItemType;
import com.pms.cms.repository.CmsGalleryItemRepository;
import com.pms.common.EntityNotFoundException;
import com.pms.common.FileStorageService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional(readOnly = true)
public class CmsGalleryItemService {

    private final CmsGalleryItemRepository repository;
    private final FileStorageService fileStorageService;

    public CmsGalleryItemService(CmsGalleryItemRepository repository, FileStorageService fileStorageService) {
        this.repository = repository;
        this.fileStorageService = fileStorageService;
    }

    public List<CmsGalleryItemDto> findActive() {
        return repository.findByActiveTrueOrderByCreatedAtDesc().stream().map(this::toDto).toList();
    }

    public List<CmsGalleryItemDto> findInactive() {
        return repository.findByActiveFalseOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public CmsGalleryItemDto create(CmsGalleryItemDto dto) {
        CmsGalleryItem item = new CmsGalleryItem();
        applyFields(item, dto);
        item.setActive(true);
        return toDto(repository.save(item));
    }

    @Transactional
    public CmsGalleryItemDto update(Long id, CmsGalleryItemDto dto) {
        CmsGalleryItem item = getOrThrow(id);
        applyFields(item, dto);
        return toDto(repository.save(item));
    }

    @Transactional
    public void deactivate(Long id) {
        CmsGalleryItem item = getOrThrow(id);
        item.setActive(false);
        repository.save(item);
    }

    @Transactional
    public void restore(Long id) {
        CmsGalleryItem item = getOrThrow(id);
        item.setActive(true);
        repository.save(item);
    }

    /** PHOTO items only - VIDEO items set mediaPathOrUrl directly via create/update. */
    @Transactional
    public CmsGalleryItemDto uploadImage(Long id, MultipartFile file) {
        CmsGalleryItem item = getOrThrow(id);
        item.setMediaPathOrUrl(fileStorageService.store(file, "cms"));
        return toDto(repository.save(item));
    }

    private void applyFields(CmsGalleryItem item, CmsGalleryItemDto dto) {
        item.setType(dto.type());
        item.setTitle(dto.title());
        item.setAlbum(dto.album());
        if (dto.type() == CmsGalleryItemType.VIDEO) {
            item.setMediaPathOrUrl(dto.mediaPathOrUrl());
        }
    }

    private CmsGalleryItem getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Gallery item not found: " + id));
    }

    private CmsGalleryItemDto toDto(CmsGalleryItem item) {
        return new CmsGalleryItemDto(item.getId(), item.getType(), item.getTitle(), item.getMediaPathOrUrl(), item.getAlbum(), item.isActive());
    }
}
