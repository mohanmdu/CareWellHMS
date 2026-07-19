package com.pms.cms.repository;

import com.pms.cms.entity.CmsCareerOpening;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CmsCareerOpeningRepository extends JpaRepository<CmsCareerOpening, Long> {
    List<CmsCareerOpening> findByActiveTrueOrderByCreatedAtDesc();

    List<CmsCareerOpening> findByActiveFalseOrderByUpdatedAtDesc();
}
