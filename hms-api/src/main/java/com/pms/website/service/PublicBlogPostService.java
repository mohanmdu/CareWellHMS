package com.pms.website.service;

import com.pms.cms.entity.CmsBlogPost;
import com.pms.cms.repository.CmsBlogPostRepository;
import com.pms.common.EntityNotFoundException;
import com.pms.website.dto.PublicBlogPostDto;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reads CmsBlogPostRepository directly (not through CmsBlogPostService) so
 * the public projection stays a narrow, deliberate facade, same idiom as
 * PublicConfigService/PublicDepartmentService.
 */
@Service
@Transactional(readOnly = true)
public class PublicBlogPostService {

    private final CmsBlogPostRepository repository;

    public PublicBlogPostService(CmsBlogPostRepository repository) {
        this.repository = repository;
    }

    public List<PublicBlogPostDto> list() {
        return repository.findByActiveTrueOrderByPublishedAtDesc().stream().map(this::toDto).toList();
    }

    public PublicBlogPostDto getBySlug(String slug) {
        CmsBlogPost post = repository.findByActiveTrueAndSlugIgnoreCase(slug)
                .orElseThrow(() -> new EntityNotFoundException("Blog post not found: " + slug));
        return toDto(post);
    }

    private PublicBlogPostDto toDto(CmsBlogPost post) {
        return new PublicBlogPostDto(
                post.getId(), post.getTitle(), post.getSlug(), post.getBody(), post.getCoverImagePath(), post.getPublishedAt());
    }
}
