package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.PharmacySaleItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PharmacySaleItemRepository extends JpaRepository<PharmacySaleItem, Long> {
}
