package com.pms.cms.repository;

import com.pms.cms.entity.CmsBlogPost;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CmsBlogPostRepository extends JpaRepository<CmsBlogPost, Long> {
    boolean existsBySlugIgnoreCase(String slug);

    boolean existsBySlugIgnoreCaseAndIdNot(String slug, Long id);

    List<CmsBlogPost> findByActiveTrueOrderByPublishedAtDesc();

    List<CmsBlogPost> findByActiveFalseOrderByUpdatedAtDesc();

    Optional<CmsBlogPost> findByActiveTrueAndSlugIgnoreCase(String slug);
}
