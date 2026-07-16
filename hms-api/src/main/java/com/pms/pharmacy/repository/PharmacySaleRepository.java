package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.PharmacyPaymentMode;
import com.pms.pharmacy.entity.PharmacySale;
import com.pms.pharmacy.entity.PharmacySaleSource;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PharmacySaleRepository extends JpaRepository<PharmacySale, Long> {

    @Query("SELECT MAX(s.billNumber) FROM PharmacySale s")
    Long findMaxBillNumber();

    Optional<PharmacySale> findByBillNumber(Long billNumber);

    @Query("""
            SELECT s FROM PharmacySale s
            WHERE (:fromInstant IS NULL OR s.billedAt >= :fromInstant)
              AND (:toInstant IS NULL OR s.billedAt < :toInstant)
              AND (:source IS NULL OR s.source = :source)
              AND (:paymentMode IS NULL OR s.paymentMode = :paymentMode)
              AND (:locationId IS NULL OR s.location.id = :locationId)
              AND (:billedBy IS NULL OR s.billedBy = :billedBy)
            ORDER BY s.billedAt DESC
            """)
    List<PharmacySale> search(
            @Param("fromInstant") Instant fromInstant,
            @Param("toInstant") Instant toInstant,
            @Param("source") PharmacySaleSource source,
            @Param("paymentMode") PharmacyPaymentMode paymentMode,
            @Param("locationId") Long locationId,
            @Param("billedBy") String billedBy);

    @Query("""
            SELECT s FROM PharmacySale s
            WHERE s.balanceAmount > 0
              AND (:source IS NULL OR s.source = :source)
              AND (:locationId IS NULL OR s.location.id = :locationId)
              AND (:pid IS NULL OR LOWER(s.patient.registrationNumber) = LOWER(:pid))
              AND (:nameOrMobile IS NULL
                   OR LOWER(CONCAT(s.patient.firstName, ' ', COALESCE(s.patient.lastName, ''))) LIKE LOWER(CONCAT('%', :nameOrMobile, '%'))
                   OR s.patient.mobileNumber LIKE CONCAT('%', :nameOrMobile, '%'))
            ORDER BY s.billedAt DESC
            """)
    List<PharmacySale> findDue(
            @Param("source") PharmacySaleSource source,
            @Param("locationId") Long locationId,
            @Param("pid") String pid,
            @Param("nameOrMobile") String nameOrMobile);
}
