package com.pms.ipadmission.repository;

import com.pms.ipadmission.entity.Admission;
import com.pms.ipadmission.entity.AdmissionStatus;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdmissionRepository extends JpaRepository<Admission, Long> {
    long countByStatus(AdmissionStatus status);

    @Query("""
            SELECT a FROM Admission a
            WHERE (:fromDate IS NULL OR a.admissionDate >= :fromDate)
              AND (:toDate IS NULL OR a.admissionDate < :toDate)
            ORDER BY a.admissionDate DESC
            """)
    List<Admission> findForAdmissionReport(@Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);
}
