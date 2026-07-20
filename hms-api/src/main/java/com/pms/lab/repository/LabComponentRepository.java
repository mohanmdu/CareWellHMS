package com.pms.lab.repository;

import com.pms.lab.entity.LabComponent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LabComponentRepository extends JpaRepository<LabComponent, Long> {
    List<LabComponent> findAllByOrderByOrderingNoAsc();

    List<LabComponent> findBySubCategoryIdInOrderByOrderingNoAsc(List<Long> subCategoryIds);

    long countBySubCategoryId(Long subCategoryId);

    @Query("SELECT COUNT(c) FROM LabComponent c WHERE c.subCategory.category.id = :categoryId")
    long countByCategoryId(@Param("categoryId") Long categoryId);
}
