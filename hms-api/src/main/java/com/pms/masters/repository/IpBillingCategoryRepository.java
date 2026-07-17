package com.pms.masters.repository;

import com.pms.masters.entity.IpBillingCategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IpBillingCategoryRepository extends JpaRepository<IpBillingCategory, Long> {
    boolean existsByNameIgnoreCase(String name);

    List<IpBillingCategory> findByActiveTrueOrderByNameAsc();

    List<IpBillingCategory> findByActiveFalseOrderByUpdatedAtDesc();
}
