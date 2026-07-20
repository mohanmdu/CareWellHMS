package com.pms.lab.repository;

import com.pms.lab.entity.LabCategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LabCategoryRepository extends JpaRepository<LabCategory, Long> {
    List<LabCategory> findAllByOrderByOrderingNoAsc();

    boolean existsByNameIgnoreCase(String name);

    @Query("SELECT c FROM LabCategory c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY c.name ASC")
    List<LabCategory> search(@Param("query") String query);
}
