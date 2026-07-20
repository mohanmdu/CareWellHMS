package com.pms.masters.repository;

import com.pms.masters.entity.OpBillingComponent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OpBillingComponentRepository extends JpaRepository<OpBillingComponent, Long> {
    List<OpBillingComponent> findByActiveTrueOrderByNameAsc();

    List<OpBillingComponent> findByActiveFalseOrderByUpdatedAtDesc();

    @Query("""
            SELECT c FROM OpBillingComponent c
            WHERE c.active = true
              AND (:categoryId IS NULL OR c.category.id = :categoryId)
              AND LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%'))
            ORDER BY c.name ASC
            """)
    List<OpBillingComponent> search(@Param("query") String query, @Param("categoryId") Long categoryId);
}
