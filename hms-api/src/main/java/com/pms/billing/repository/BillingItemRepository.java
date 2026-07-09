package com.pms.billing.repository;

import com.pms.billing.entity.BillingItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillingItemRepository extends JpaRepository<BillingItem, Long> {
}
