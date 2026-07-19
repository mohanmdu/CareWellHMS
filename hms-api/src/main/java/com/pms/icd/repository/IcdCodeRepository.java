package com.pms.icd.repository;

import com.pms.icd.entity.IcdCode;
import com.pms.icd.entity.IcdVersion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IcdCodeRepository extends JpaRepository<IcdCode, Long> {
    List<IcdCode> findByActiveTrueOrderByCodeAsc();

    List<IcdCode> findByActiveFalseOrderByUpdatedAtDesc();

    boolean existsByVersionAndCodeIgnoreCase(IcdVersion version, String code);

    @Query("""
            SELECT c FROM IcdCode c
            WHERE c.active = true
              AND (:version IS NULL OR c.version = :version)
              AND (LOWER(c.code) LIKE LOWER(CONCAT('%', :query, '%'))
                   OR LOWER(c.diseaseName) LIKE LOWER(CONCAT('%', :query, '%')))
            ORDER BY c.code ASC
            """)
    List<IcdCode> search(@Param("query") String query, @Param("version") IcdVersion version);
}
