package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.PharmacyStockTransaction;
import com.pms.pharmacy.entity.PharmacyStockTransactionType;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PharmacyStockTransactionRepository extends JpaRepository<PharmacyStockTransaction, Long> {

    @Query("""
            SELECT t FROM PharmacyStockTransaction t
            WHERE t.transactionType = :type
              AND (:locationId IS NULL OR t.location.id = :locationId)
              AND (:fromInstant IS NULL OR t.updatedAt >= :fromInstant)
              AND (:toInstant IS NULL OR t.updatedAt < :toInstant)
            ORDER BY t.updatedAt DESC
            """)
    List<PharmacyStockTransaction> search(
            @Param("type") PharmacyStockTransactionType type,
            @Param("locationId") Long locationId,
            @Param("fromInstant") Instant fromInstant,
            @Param("toInstant") Instant toInstant);

    @Query("""
            SELECT COALESCE(SUM(t.quantity), 0) FROM PharmacyStockTransaction t
            WHERE t.stock.product.id = :productId AND t.transactionType = :type
            """)
    int sumQuantityByProductAndType(@Param("productId") Long productId, @Param("type") PharmacyStockTransactionType type);
}
