package com.pms.cms.repository;

import com.pms.cms.entity.CmsNewsEvent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CmsNewsEventRepository extends JpaRepository<CmsNewsEvent, Long> {
    List<CmsNewsEvent> findByActiveTrueOrderByPublishedAtDesc();

    List<CmsNewsEvent> findByActiveFalseOrderByUpdatedAtDesc();
}
