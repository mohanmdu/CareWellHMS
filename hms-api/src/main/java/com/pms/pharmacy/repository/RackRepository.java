package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.Rack;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RackRepository extends JpaRepository<Rack, Long> {
    boolean existsByNameIgnoreCase(String name);

    List<Rack> findByActiveTrueOrderByNameAsc();

    List<Rack> findByActiveFalseOrderByUpdatedAtDesc();
}
