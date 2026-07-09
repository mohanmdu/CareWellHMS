package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.Drug;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DrugRepository extends JpaRepository<Drug, Long> {
    boolean existsByNameIgnoreCase(String name);
}
