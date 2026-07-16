package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.GrnItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GrnItemRepository extends JpaRepository<GrnItem, Long> {

    /** Stock Balance Report's "Opening Stock" - total ever received via approved GRNs for a product. */
    @Query("""
            SELECT COALESCE(SUM(i.totalQty + i.freeQty), 0) FROM GrnItem i
            WHERE i.product.id = :productId AND i.grn.status = com.pms.pharmacy.entity.GrnStatus.APPROVED
            """)
    int sumReceivedQtyByProductId(@Param("productId") Long productId);
}
