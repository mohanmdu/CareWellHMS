package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.ProductType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductTypeRepository extends JpaRepository<ProductType, Long> {
    boolean existsByNameIgnoreCase(String name);

    List<ProductType> findByActiveTrueOrderByNameAsc();

    List<ProductType> findByActiveFalseOrderByUpdatedAtDesc();
}
