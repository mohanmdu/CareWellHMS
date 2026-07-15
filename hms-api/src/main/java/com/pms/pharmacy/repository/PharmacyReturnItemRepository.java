package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.PharmacyReturnItem;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PharmacyReturnItemRepository extends JpaRepository<PharmacyReturnItem, Long> {

    // Sums across PENDING and APPROVED alike - a PENDING request already
    // claims that quantity and must block a second submission against the
    // same remainder.
    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM PharmacyReturnItem i WHERE i.saleItem.id = :saleItemId")
    int sumQuantityBySaleItemId(@Param("saleItemId") Long saleItemId);

    @Query("""
            SELECT i FROM PharmacyReturnItem i
            WHERE i.pharmacyReturn.status = com.pms.pharmacy.entity.PharmacyReturnStatus.APPROVED
              AND (:fromInstant IS NULL OR i.pharmacyReturn.approvedAt >= :fromInstant)
              AND (:toInstant IS NULL OR i.pharmacyReturn.approvedAt < :toInstant)
            ORDER BY i.pharmacyReturn.approvedAt DESC
            """)
    List<PharmacyReturnItem> searchApprovedLines(@Param("fromInstant") Instant fromInstant, @Param("toInstant") Instant toInstant);
}
