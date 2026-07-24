package com.pms.ipbilling.repository;

import com.pms.ipbilling.entity.IpBillingLineItem;
import com.pms.masters.entity.RevenueBucket;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IpBillingLineItemRepository extends JpaRepository<IpBillingLineItem, Long> {
    List<IpBillingLineItem> findByAdmissionIdOrderByRequestedOnAsc(Long admissionId);

    @Query("""
            SELECT i FROM IpBillingLineItem i
            WHERE (:fromInstant IS NULL OR i.requestedOn >= :fromInstant)
              AND (:toInstant IS NULL OR i.requestedOn < :toInstant)
              AND (:consultantId IS NULL OR i.consultant.id = :consultantId)
            """)
    List<IpBillingLineItem> findForConsultantWiseReport(
            @Param("fromInstant") Instant fromInstant,
            @Param("toInstant") Instant toInstant,
            @Param("consultantId") Long consultantId);

    // CEO/MD Dashboard IP Revenue's Consulting Fee vs "IP Billing" (other)
    // split - CONSULTING_FEE gets its own slice, every other bucket rolls up
    // into "IP Billing" in the service.
    @Query("""
            SELECT i.category.revenueBucket AS bucket, COALESCE(SUM(i.lineTotal - i.discountAmount - i.refundAmount), 0) AS amount
            FROM IpBillingLineItem i
            WHERE (:fromInstant IS NULL OR i.requestedOn >= :fromInstant)
              AND (:toInstant IS NULL OR i.requestedOn < :toInstant)
            GROUP BY i.category.revenueBucket
            """)
    List<RevenueBucketAmount> sumByRevenueBucket(@Param("fromInstant") Instant fromInstant, @Param("toInstant") Instant toInstant);

    /** Projection for sumByRevenueBucket(). */
    interface RevenueBucketAmount {
        RevenueBucket getBucket();

        double getAmount();
    }
}
