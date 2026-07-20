package com.pms.lab.repository;

import com.pms.lab.entity.LabSubCategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LabSubCategoryRepository extends JpaRepository<LabSubCategory, Long> {
    List<LabSubCategory> findAllByOrderByOrderingNoAsc();

    long countByCategoryId(Long categoryId);

    boolean existsByCategoryIdAndNameIgnoreCase(Long categoryId, String name);

    @Query("""
            SELECT s FROM LabSubCategory s
            WHERE (:categoryId IS NULL OR s.category.id = :categoryId)
              AND LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%'))
            ORDER BY s.name ASC
            """)
    List<LabSubCategory> search(@Param("query") String query, @Param("categoryId") Long categoryId);
}
