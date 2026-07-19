package com.pms.cms.repository;

import com.pms.cms.entity.CmsTestimonial;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CmsTestimonialRepository extends JpaRepository<CmsTestimonial, Long> {
    List<CmsTestimonial> findByActiveTrueOrderByCreatedAtDesc();

    List<CmsTestimonial> findByActiveFalseOrderByUpdatedAtDesc();
}
