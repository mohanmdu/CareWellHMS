package com.pms.cms.repository;

import com.pms.cms.entity.CmsFaq;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CmsFaqRepository extends JpaRepository<CmsFaq, Long> {
    List<CmsFaq> findByActiveTrueOrderBySortOrderAscQuestionAsc();

    List<CmsFaq> findByActiveFalseOrderByUpdatedAtDesc();
}
