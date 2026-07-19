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

    @Query("""
            SELECT a FROM Admission a
            WHERE a.status = com.pms.ipadmission.entity.AdmissionStatus.DISCHARGED
              AND (:fromDate IS NULL OR a.dischargeDate >= :fromDate)
              AND (:toDate IS NULL OR a.dischargeDate < :toDate)
            ORDER BY a.dischargeDate DESC
            """)
    List<Admission> findDischargedForList(@Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);

    @Query("""
            SELECT a FROM Admission a
            WHERE a.status = com.pms.ipadmission.entity.AdmissionStatus.CANCELLED
              AND (:fromDate IS NULL OR a.cancelledAt >= :fromDate)
              AND (:toDate IS NULL OR a.cancelledAt <= :toDate)
            ORDER BY a.cancelledAt DESC
            """)
    List<Admission> findCancelledForList(@Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);
}
