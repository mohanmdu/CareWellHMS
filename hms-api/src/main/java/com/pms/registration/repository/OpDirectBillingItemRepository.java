package com.pms.registration.repository;

import com.pms.masters.entity.RevenueBucket;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Didn't exist before the CEO/MD Dashboard - OpDirectBillingItem rows were
 * previously only reached via OpDirectBilling.getItems(), never queried
 * directly across bills.
 */
public interface OpDirectBillingItemRepository extends JpaRepository<com.pms.registration.entity.OpDirectBillingItem, Long> {

    /**
     * CEO/MD Dashboard OP Revenue's "Other" slice (and folds a walk-in item
     * tagged LAB/RADIOLOGY/PHARMACY into those quadrant slices instead, via
     * OpBillingCategory.revenueBucket - a walk-in "Lab Charge" is still lab
     * revenue, not "other"). categoryName is matched against OpBillingCategory
     * by name since the item only snapshots the category's display name.
     */
    @Query("""
            SELECT c.revenueBucket AS bucket, COALESCE(SUM(i.amount), 0) AS amount
            FROM OpDirectBillingItem i
            JOIN OpBillingCategory c ON c.name = i.categoryName
            WHERE (:fromInstant IS NULL OR i.billing.billedAt >= :fromInstant)
              AND (:toInstant IS NULL OR i.billing.billedAt < :toInstant)
            GROUP BY c.revenueBucket
            """)
    List<RevenueBucketAmount> sumByRevenueBucket(@Param("fromInstant") Instant fromInstant, @Param("toInstant") Instant toInstant);

    /** Projection for sumByRevenueBucket(). */
    interface RevenueBucketAmount {
        RevenueBucket getBucket();

        double getAmount();
    }
}
