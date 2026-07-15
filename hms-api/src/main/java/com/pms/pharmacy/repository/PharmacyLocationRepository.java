package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.PharmacyLocation;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PharmacyLocationRepository extends JpaRepository<PharmacyLocation, Long> {
    boolean existsByNameIgnoreCase(String name);

    List<PharmacyLocation> findByActiveTrueOrderByNameAsc();

    List<PharmacyLocation> findByActiveFalseOrderByUpdatedAtDesc();
}
