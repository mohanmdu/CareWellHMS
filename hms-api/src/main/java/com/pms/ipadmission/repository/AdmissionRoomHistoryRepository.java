package com.pms.ipadmission.repository;

import com.pms.ipadmission.entity.AdmissionRoomHistory;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdmissionRoomHistoryRepository extends JpaRepository<AdmissionRoomHistory, Long> {
    List<AdmissionRoomHistory> findByAdmissionIdOrderByFromDateAsc(Long admissionId);

    Optional<AdmissionRoomHistory> findByAdmissionIdAndToDateIsNull(Long admissionId);

    /**
     * CEO/MD Dashboard IP Revenue's Room Rent slice - sums dailyRate x
     * overlap-days across every room-occupancy period across ALL admissions,
     * clipped to [from, to). Mirrors IpBillingService.computeWardStays()'s
     * exact pricing rule (INSURANCE admissions bill at rent_claim, everyone
     * else at rent_cash) and its fractional-day math, but as one cross-
     * admission aggregate instead of per-admission Java loops.
     *
     * `from`/`to` are nullable (an unbounded filter passes null, not a
     * Java-computed "now" sentinel) deliberately - this database's JDBC URL
     * has serverTimezone=UTC while the MySQL server itself runs in SYSTEM
     * (IST) time, so a bound LocalDateTime.now() parameter silently gets
     * shifted ~5.5 hours off from the server's own NOW(), undercounting
     * every still-open admission's accrued rent. Falling back to the
     * server's own NOW() (and to a period's own natural bounds) inside the
     * query itself sidesteps that skew entirely - confirmed by reproducing
     * the exact discrepancy with a manually 5:30-shifted bound in MySQL
     * directly, then eliminating it by never sending "now" as a parameter.
     */
    @Query(
            value = """
                    SELECT COALESCE(SUM(
                      GREATEST(TIMESTAMPDIFF(MINUTE,
                        GREATEST(h.from_date, COALESCE(:from, h.from_date)),
                        LEAST(COALESCE(h.to_date, a.discharge_date, NOW()), COALESCE(:to, COALESCE(h.to_date, a.discharge_date, NOW())))
                      ), 0) / 1440.0
                      * CASE WHEN a.payment_type = 'INSURANCE' THEN rt.rent_claim ELSE rt.rent_cash END
                    ), 0)
                    FROM admission_room_history h
                    JOIN admission a ON a.id = h.admission_id
                    JOIN room r ON r.id = h.room_id
                    JOIN room_type rt ON rt.id = r.room_type_id
                    WHERE (:from IS NULL OR COALESCE(h.to_date, a.discharge_date, NOW()) > :from)
                      AND (:to IS NULL OR h.from_date < :to)
                    """,
            nativeQuery = true)
    double sumWardRevenueForDashboard(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
