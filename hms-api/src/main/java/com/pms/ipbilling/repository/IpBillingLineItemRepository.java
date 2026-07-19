package com.pms.ipbilling.repository;

import com.pms.ipbilling.entity.IpBillingLineItem;
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
}
