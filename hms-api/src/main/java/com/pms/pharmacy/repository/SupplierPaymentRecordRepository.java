package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.SupplierPaymentRecord;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SupplierPaymentRecordRepository extends JpaRepository<SupplierPaymentRecord, Long> {

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM SupplierPaymentRecord p WHERE p.grn.id = :grnId")
    double sumByGrnId(@Param("grnId") Long grnId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM SupplierPaymentRecord p WHERE p.grn.supplier.id = :supplierId")
    double sumBySupplierId(@Param("supplierId") Long supplierId);

    List<SupplierPaymentRecord> findByGrnIdOrderByPaidAtDesc(Long grnId);
}
