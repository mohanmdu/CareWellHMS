package com.pms.billing.repository;

import com.pms.billing.entity.BillingCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillingCategoryRepository extends JpaRepository<BillingCategory, Long> {
    boolean existsByNameIgnoreCase(String name);
}
