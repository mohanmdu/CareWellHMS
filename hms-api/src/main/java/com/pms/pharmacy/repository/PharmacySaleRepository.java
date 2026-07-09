package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.PharmacySale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PharmacySaleRepository extends JpaRepository<PharmacySale, Long> {

    @Query("select coalesce(sum(s.totalAmount), 0) from PharmacySale s")
    double sumTotalAmount();
}
