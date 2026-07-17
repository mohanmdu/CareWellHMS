package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.PharmacyStock;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PharmacyStockRepository extends JpaRepository<PharmacyStock, Long> {
    /** FEFO (first-expiry-first-out) ordering for the billing batch-picker. */
    List<PharmacyStock> findByProductIdAndQuantityOnHandGreaterThanOrderByExpiryDateAsc(Long productId, int minQuantity);

    List<PharmacyStock> findByQuantityOnHandGreaterThanOrderByProductNameAsc(int minQuantity);

    Optional<PharmacyStock> findByGrnItemId(Long grnItemId);

    /** Rich multi-column autocomplete for Stock Adjustment / Batch-wise Stock Modifier. */
    @Query("""
            SELECT s FROM PharmacyStock s
            WHERE s.quantityOnHand > 0
              AND (LOWER(s.productName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(s.batch) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY s.productName ASC
            """)
    List<PharmacyStock> search(@Param("search") String search);

    /** Purchase Return's "Get Stock" - joins back to the receiving GRN for Supplier/Invoice/date filters. */
    @Query("""
            SELECT s FROM PharmacyStock s
            JOIN s.grnItem gi
            JOIN gi.grn g
            WHERE s.quantityOnHand > 0
              AND (:supplierId IS NULL OR g.supplier.id = :supplierId)
              AND (:drugName IS NULL OR LOWER(s.productName) LIKE LOWER(CONCAT('%', :drugName, '%')))
              AND (:fromDate IS NULL OR g.grnDate >= :fromDate)
              AND (:toDate IS NULL OR g.grnDate <= :toDate)
            ORDER BY s.productName ASC
            """)
    List<PharmacyStock> findEligibleForPurchaseReturn(
            @Param("supplierId") Long supplierId,
            @Param("drugName") String drugName,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);

    /** Expired Report - in-stock batches whose expiry falls in [fromDate, toDate], joined for Supplier/Manufacturer. */
    @Query("""
            SELECT s FROM PharmacyStock s
            JOIN s.grnItem gi
            JOIN gi.grn g
            WHERE s.quantityOnHand > 0
              AND s.expiryDate IS NOT NULL
              AND (:fromDate IS NULL OR s.expiryDate >= :fromDate)
              AND s.expiryDate <= :toDate
            ORDER BY s.expiryDate ASC
            """)
    List<PharmacyStock> searchExpiring(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);
}
