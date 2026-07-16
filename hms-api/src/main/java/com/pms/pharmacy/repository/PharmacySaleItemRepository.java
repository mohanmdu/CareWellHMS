package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.DrugScheduleType;
import com.pms.pharmacy.entity.PharmacySaleItem;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PharmacySaleItemRepository extends JpaRepository<PharmacySaleItem, Long> {

    /** Stock Balance Report's "Sale Qty" - total sold for a product. */
    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM PharmacySaleItem i WHERE i.stock.product.id = :productId")
    int sumQuantityByProductId(@Param("productId") Long productId);

    /** Sales GST Report / VAT / GST Statement source rows. */
    @Query("""
            SELECT i FROM PharmacySaleItem i
            WHERE (:fromInstant IS NULL OR i.sale.billedAt >= :fromInstant)
              AND (:toInstant IS NULL OR i.sale.billedAt < :toInstant)
            ORDER BY i.sale.billedAt DESC
            """)
    List<PharmacySaleItem> searchLines(@Param("fromInstant") Instant fromInstant, @Param("toInstant") Instant toInstant);

    /** DI Report (Schedule/Schedule-H/H1 register). */
    @Query("""
            SELECT i FROM PharmacySaleItem i
            WHERE (:fromInstant IS NULL OR i.sale.billedAt >= :fromInstant)
              AND (:toInstant IS NULL OR i.sale.billedAt < :toInstant)
              AND ((:scheduleType IS NULL AND i.stock.product.scheduleType <> com.pms.pharmacy.entity.DrugScheduleType.NONE)
                   OR i.stock.product.scheduleType = :scheduleType)
              AND (:patientId IS NULL OR i.sale.patient.id = :patientId)
              AND (:nameOrMobile IS NULL
                   OR LOWER(CONCAT(i.sale.patient.firstName, ' ', COALESCE(i.sale.patient.lastName, ''))) LIKE LOWER(CONCAT('%', :nameOrMobile, '%'))
                   OR i.sale.patient.mobileNumber LIKE CONCAT('%', :nameOrMobile, '%'))
            ORDER BY i.sale.billedAt DESC
            """)
    List<PharmacySaleItem> searchForDiReport(
            @Param("fromInstant") Instant fromInstant,
            @Param("toInstant") Instant toInstant,
            @Param("scheduleType") DrugScheduleType scheduleType,
            @Param("patientId") Long patientId,
            @Param("nameOrMobile") String nameOrMobile);
}
