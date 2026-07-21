package com.pms.lab.repository;

import com.pms.lab.entity.LabRefund;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LabRefundRepository extends JpaRepository<LabRefund, Long> {
    Optional<LabRefund> findByRequisitionId(Long requisitionId);

    boolean existsByRequisitionId(Long requisitionId);

    Optional<LabRefund> findTopByOrderByRefundNumberDesc();

    @Query("""
            SELECT r FROM LabRefund r
            WHERE (:from IS NULL OR r.refundedAt >= :from)
              AND (:to IS NULL OR r.refundedAt < :to)
            ORDER BY r.refundedAt DESC
            """)
    List<LabRefund> report(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
