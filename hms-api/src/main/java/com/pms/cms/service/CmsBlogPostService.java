package com.pms.cms.service;

import com.pms.cms.dto.CmsBlogPostDto;
import com.pms.cms.entity.CmsBlogPost;
import com.pms.cms.repository.CmsBlogPostRepository;
import com.pms.common.EntityNotFoundException;
import com.pms.common.FileStorageService;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional(readOnly = true)
public class CmsBlogPostService {

    private final CmsBlogPostRepository repository;
    private final FileStorageService fileStorageService;

    public CmsBlogPostService(CmsBlogPostRepository repository, FileStorageService fileStorageService) {
        this.repository = repository;
        this.fileStorageService = fileStorageService;
    }

    public List<CmsBlogPostDto> findActive() {
        return repository.findByActiveTrueOrderByPublishedAtDesc().stream().map(this::toDto).toList();
    }

    public List<CmsBlogPostDto> findInactive() {
        return repository.findByActiveFalseOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public CmsBlogPostDto create(CmsBlogPostDto dto) {
        if (repository.existsBySlugIgnoreCase(dto.slug())) {
            throw new IllegalArgumentException("Slug already exists: " + dto.slug());
        }
        CmsBlogPost post = new CmsBlogPost();
        applyFields(post, dto);
        post.setActive(true);
        post.setPublishedAt(Instant.now());
        return toDto(repository.save(post));
    }

    @Transactional
    public CmsBlogPostDto update(Long id, CmsBlogPostDto dto) {
        if (repository.existsBySlugIgnoreCaseAndIdNot(dto.slug(), id)) {
            throw new IllegalArgumentException("Slug already exists: " + dto.slug());
        }
        CmsBlogPost post = getOrThrow(id);
        applyFields(post, dto);
        return toDto(repository.save(post));
    }

    @Transactional
    public void deactivate(Long id) {
        CmsBlogPost post = getOrThrow(id);
        post.setActive(false);
        repository.save(post);
    }

    @Transactional
    public void restore(Long id) {
        CmsBlogPost post = getOrThrow(id);
        post.setActive(true);
        repository.save(post);
    }

    @Transactional
    public CmsBlogPostDto uploadImage(Long id, MultipartFile file) {
        CmsBlogPost post = getOrThrow(id);
        post.setCoverImagePath(fileStorageService.store(file, "cms"));
        return toDto(repository.save(post));
    }

    private void applyFields(CmsBlogPost post, CmsBlogPostDto dto) {
        post.setTitle(dto.title());
        post.setSlug(dto.slug());
        post.setBody(dto.body());
    }

    private CmsBlogPost getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Blog post not found: " + id));
    }

    private CmsBlogPostDto toDto(CmsBlogPost post) {
        return new CmsBlogPostDto(
                post.getId(), post.getTitle(), post.getSlug(), post.getBody(), post.getCoverImagePath(), post.getPublishedAt(), post.isActive());
    }
}
