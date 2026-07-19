package com.pms.cms.service;

import com.pms.cms.dto.CmsBannerSlideDto;
import com.pms.cms.entity.CmsBannerSlide;
import com.pms.cms.repository.CmsBannerSlideRepository;
import com.pms.common.EntityNotFoundException;
import com.pms.common.FileStorageService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional(readOnly = true)
public class CmsBannerSlideService {

    private final CmsBannerSlideRepository repository;
    private final FileStorageService fileStorageService;

    public CmsBannerSlideService(CmsBannerSlideRepository repository, FileStorageService fileStorageService) {
        this.repository = repository;
        this.fileStorageService = fileStorageService;
    }

    public List<CmsBannerSlideDto> findActive() {
        return repository.findByActiveTrueOrderBySortOrderAscTitleAsc().stream().map(this::toDto).toList();
    }

    public List<CmsBannerSlideDto> findInactive() {
        return repository.findByActiveFalseOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public CmsBannerSlideDto create(CmsBannerSlideDto dto) {
        CmsBannerSlide slide = new CmsBannerSlide();
        applyFields(slide, dto);
        slide.setActive(true);
        return toDto(repository.save(slide));
    }

    @Transactional
    public CmsBannerSlideDto update(Long id, CmsBannerSlideDto dto) {
        CmsBannerSlide slide = getOrThrow(id);
        applyFields(slide, dto);
        return toDto(repository.save(slide));
    }

    @Transactional
    public void deactivate(Long id) {
        CmsBannerSlide slide = getOrThrow(id);
        slide.setActive(false);
        repository.save(slide);
    }

    @Transactional
    public void restore(Long id) {
        CmsBannerSlide slide = getOrThrow(id);
        slide.setActive(true);
        repository.save(slide);
    }

    @Transactional
    public CmsBannerSlideDto uploadImage(Long id, MultipartFile file) {
        CmsBannerSlide slide = getOrThrow(id);
        slide.setImagePath(fileStorageService.store(file, "cms"));
        return toDto(repository.save(slide));
    }

    private void applyFields(CmsBannerSlide slide, CmsBannerSlideDto dto) {
        slide.setTitle(dto.title());
        slide.setSubtitle(dto.subtitle());
        slide.setLinkUrl(dto.linkUrl());
        slide.setSortOrder(dto.sortOrder());
    }

    private CmsBannerSlide getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Banner slide not found: " + id));
    }

    private CmsBannerSlideDto toDto(CmsBannerSlide slide) {
        return new CmsBannerSlideDto(
                slide.getId(), slide.getTitle(), slide.getSubtitle(), slide.getImagePath(), slide.getLinkUrl(), slide.getSortOrder(), slide.isActive());
    }
}
