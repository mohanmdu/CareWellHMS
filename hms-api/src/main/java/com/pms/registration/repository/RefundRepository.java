package com.pms.registration.repository;

import com.pms.registration.entity.Refund;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefundRepository extends JpaRepository<Refund, Long> {
    Optional<Refund> findByAppointmentId(Long appointmentId);

    boolean existsByAppointmentId(Long appointmentId);

    Optional<Refund> findByOpDirectBillingId(Long opDirectBillingId);

    boolean existsByOpDirectBillingId(Long opDirectBillingId);

    // Derives the next refund number from the actual max already in the
    // table rather than a row count seeded once at startup - see
    // PatientService.nextRegistrationNumber for why that drifts after deletions.
    Optional<Refund> findTopByOrderByRefundNumberDesc();

    // Explicit LEFT JOINs - a plain "r.appointment.consultant.id" path
    // expression would implicitly INNER JOIN and silently drop every OP
    // Direct Billing refund (appointment_id IS NULL) from the report.
    @Query("""
            SELECT r FROM Refund r
            LEFT JOIN r.appointment a
            LEFT JOIN a.consultant c
            WHERE (:fromInstant IS NULL OR r.refundedAt >= :fromInstant)
              AND (:toInstant IS NULL OR r.refundedAt < :toInstant)
              AND (:consultantId IS NULL OR c.id = :consultantId)
            ORDER BY r.refundedAt DESC
            """)
    List<Refund> report(
            @Param("fromInstant") Instant fromInstant,
            @Param("toInstant") Instant toInstant,
            @Param("consultantId") Long consultantId);
}
