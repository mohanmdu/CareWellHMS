package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.Manufacturer;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ManufacturerRepository extends JpaRepository<Manufacturer, Long> {
    List<Manufacturer> findByActiveTrueOrderByNameAsc();

    List<Manufacturer> findByActiveFalseOrderByUpdatedAtDesc();
}
