package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.PharmacySaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PharmacySaleItemRepository extends JpaRepository<PharmacySaleItem, Long> {

    /** Stock Balance Report's "Sale Qty" - total sold for a product. */
    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM PharmacySaleItem i WHERE i.stock.product.id = :productId")
    int sumQuantityByProductId(@Param("productId") Long productId);
}
