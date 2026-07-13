package com.pms.masters.repository;

import com.pms.masters.entity.OpBillingCategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OpBillingCategoryRepository extends JpaRepository<OpBillingCategory, Long> {
    boolean existsByNameIgnoreCase(String name);

    List<OpBillingCategory> findByActiveTrueOrderByNameAsc();

    List<OpBillingCategory> findByActiveFalseOrderByUpdatedAtDesc();
}
