package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.PharmacyPurchaseReturn;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PharmacyPurchaseReturnRepository extends JpaRepository<PharmacyPurchaseReturn, Long> {

    @Query("""
            SELECT r FROM PharmacyPurchaseReturn r
            WHERE (:fromInstant IS NULL OR r.createdAt >= :fromInstant)
              AND (:toInstant IS NULL OR r.createdAt < :toInstant)
            ORDER BY r.createdAt DESC
            """)
    List<PharmacyPurchaseReturn> search(@Param("fromInstant") Instant fromInstant, @Param("toInstant") Instant toInstant);
}
