package com.pms.cms.repository;

import com.pms.cms.entity.CmsBannerSlide;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CmsBannerSlideRepository extends JpaRepository<CmsBannerSlide, Long> {
    List<CmsBannerSlide> findByActiveTrueOrderBySortOrderAscTitleAsc();

    List<CmsBannerSlide> findByActiveFalseOrderByUpdatedAtDesc();
}
