package com.pms.cms.repository;

import com.pms.cms.entity.CmsHealthPackage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CmsHealthPackageRepository extends JpaRepository<CmsHealthPackage, Long> {
    List<CmsHealthPackage> findByActiveTrueOrderByNameAsc();

    List<CmsHealthPackage> findByActiveFalseOrderByUpdatedAtDesc();
}
