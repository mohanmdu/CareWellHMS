package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.PharmacyReturn;
import com.pms.pharmacy.entity.PharmacyReturnStatus;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PharmacyReturnRepository extends JpaRepository<PharmacyReturn, Long> {

    @Query("""
            SELECT r FROM PharmacyReturn r
            WHERE r.status = :status
              AND (:fromInstant IS NULL OR COALESCE(r.approvedAt, r.submittedAt) >= :fromInstant)
              AND (:toInstant IS NULL OR COALESCE(r.approvedAt, r.submittedAt) < :toInstant)
              AND (:locationId IS NULL OR r.sale.location.id = :locationId)
            ORDER BY COALESCE(r.approvedAt, r.submittedAt) DESC
            """)
    List<PharmacyReturn> search(
            @Param("status") PharmacyReturnStatus status,
            @Param("fromInstant") Instant fromInstant,
            @Param("toInstant") Instant toInstant,
            @Param("locationId") Long locationId);
}
