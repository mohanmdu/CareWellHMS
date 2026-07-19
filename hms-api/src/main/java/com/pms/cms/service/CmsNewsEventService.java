package com.pms.cms.service;

import com.pms.cms.dto.CmsNewsEventDto;
import com.pms.cms.entity.CmsNewsEvent;
import com.pms.cms.repository.CmsNewsEventRepository;
import com.pms.common.EntityNotFoundException;
import com.pms.common.FileStorageService;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional(readOnly = true)
public class CmsNewsEventService {

    private final CmsNewsEventRepository repository;
    private final FileStorageService fileStorageService;

    public CmsNewsEventService(CmsNewsEventRepository repository, FileStorageService fileStorageService) {
        this.repository = repository;
        this.fileStorageService = fileStorageService;
    }

    public List<CmsNewsEventDto> findActive() {
        return repository.findByActiveTrueOrderByPublishedAtDesc().stream().map(this::toDto).toList();
    }

    public List<CmsNewsEventDto> findInactive() {
        return repository.findByActiveFalseOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public CmsNewsEventDto create(CmsNewsEventDto dto) {
        CmsNewsEvent event = new CmsNewsEvent();
        applyFields(event, dto);
        event.setActive(true);
        event.setPublishedAt(Instant.now());
        return toDto(repository.save(event));
    }

    @Transactional
    public CmsNewsEventDto update(Long id, CmsNewsEventDto dto) {
        CmsNewsEvent event = getOrThrow(id);
        applyFields(event, dto);
        return toDto(repository.save(event));
    }

    @Transactional
    public void deactivate(Long id) {
        CmsNewsEvent event = getOrThrow(id);
        event.setActive(false);
        repository.save(event);
    }

    @Transactional
    public void restore(Long id) {
        CmsNewsEvent event = getOrThrow(id);
        event.setActive(true);
        repository.save(event);
    }

    @Transactional
    public CmsNewsEventDto uploadImage(Long id, MultipartFile file) {
        CmsNewsEvent event = getOrThrow(id);
        event.setCoverImagePath(fileStorageService.store(file, "cms"));
        return toDto(repository.save(event));
    }

    private void applyFields(CmsNewsEvent event, CmsNewsEventDto dto) {
        event.setTitle(dto.title());
        event.setBody(dto.body());
        event.setEventDate(dto.eventDate());
    }

    private CmsNewsEvent getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("News/event not found: " + id));
    }

    private CmsNewsEventDto toDto(CmsNewsEvent event) {
        return new CmsNewsEventDto(
                event.getId(), event.getTitle(), event.getBody(), event.getEventDate(), event.getCoverImagePath(), event.getPublishedAt(), event.isActive());
    }
}
