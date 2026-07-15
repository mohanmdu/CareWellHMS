package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.PharmacyStock;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PharmacyStockRepository extends JpaRepository<PharmacyStock, Long> {
    /** FEFO (first-expiry-first-out) ordering for the billing batch-picker. */
    List<PharmacyStock> findByProductIdAndQuantityOnHandGreaterThanOrderByExpiryDateAsc(Long productId, int minQuantity);

    List<PharmacyStock> findByQuantityOnHandGreaterThanOrderByProductNameAsc(int minQuantity);
}
