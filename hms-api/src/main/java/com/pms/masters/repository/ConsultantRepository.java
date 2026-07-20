package com.pms.masters.repository;

import com.pms.masters.entity.Consultant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConsultantRepository extends JpaRepository<Consultant, Long> {
    long countByDepartmentId(Long departmentId);

    List<Consultant> findByActiveTrueOrderByNameAsc();

    List<Consultant> findByActiveFalseOrderByUpdatedAtDesc();

    List<Consultant> findByActiveTrueAndPublishedToWebTrueOrderByNameAsc();

    @Query("SELECT c FROM Consultant c WHERE c.active = true AND LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY c.name ASC")
    List<Consultant> search(@Param("query") String query);
}
