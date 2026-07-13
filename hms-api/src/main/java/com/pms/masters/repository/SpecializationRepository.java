package com.pms.masters.repository;

import com.pms.masters.entity.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpecializationRepository extends JpaRepository<Specialization, Long> {
    boolean existsByNameIgnoreCase(String name);
}
