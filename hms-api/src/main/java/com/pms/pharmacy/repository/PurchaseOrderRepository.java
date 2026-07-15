package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.PurchaseOrder;
import com.pms.pharmacy.entity.PurchaseOrderStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findByStatusOrderByCreatedAtDesc(PurchaseOrderStatus status);

    @Query("SELECT MAX(p.poNumber) FROM PurchaseOrder p")
    Long findMaxPoNumber();
}
