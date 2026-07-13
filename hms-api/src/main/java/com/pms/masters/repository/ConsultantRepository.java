package com.pms.masters.repository;

import com.pms.masters.entity.Consultant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsultantRepository extends JpaRepository<Consultant, Long> {
    long countByDepartmentId(Long departmentId);

    List<Consultant> findByActiveTrueOrderByNameAsc();

    List<Consultant> findByActiveFalseOrderByUpdatedAtDesc();
}
