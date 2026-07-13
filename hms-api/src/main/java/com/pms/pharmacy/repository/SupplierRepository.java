package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.Supplier;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    List<Supplier> findByActiveTrueOrderByNameAsc();

    List<Supplier> findByActiveFalseOrderByUpdatedAtDesc();
}
