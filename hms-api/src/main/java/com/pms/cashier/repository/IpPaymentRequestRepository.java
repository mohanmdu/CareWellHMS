package com.pms.cashier.repository;

import com.pms.cashier.entity.IpPaymentRequest;
import com.pms.cashier.entity.PaymentRequestStatus;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IpPaymentRequestRepository extends JpaRepository<IpPaymentRequest, Long> {
    List<IpPaymentRequest> findByStatusOrderByRequestedAtDesc(PaymentRequestStatus status);

    long countByStatus(PaymentRequestStatus status);

    @Query("""
            SELECT r FROM IpPaymentRequest r
            WHERE r.status = com.pms.cashier.entity.PaymentRequestStatus.APPROVED
              AND (:fromInstant IS NULL OR r.approvedAt >= :fromInstant)
              AND (:toInstant IS NULL OR r.approvedAt < :toInstant)
            ORDER BY r.approvedAt ASC
            """)
    List<IpPaymentRequest> findApprovedForReport(@Param("fromInstant") Instant fromInstant, @Param("toInstant") Instant toInstant);
}
