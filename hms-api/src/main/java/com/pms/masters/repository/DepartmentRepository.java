package com.pms.masters.repository;

import com.pms.masters.entity.Department;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    boolean existsByNameIgnoreCase(String name);

    List<Department> findByActiveTrue();
}
