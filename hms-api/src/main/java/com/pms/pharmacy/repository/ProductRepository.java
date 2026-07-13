package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.Product;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrueOrderByNameAsc();

    List<Product> findByActiveFalseOrderByUpdatedAtDesc();
}
