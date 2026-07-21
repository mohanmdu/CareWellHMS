package com.pms.insurance.repository;

import com.pms.insurance.entity.PreAuthorizationRequest;
import com.pms.insurance.entity.PreAuthorizationStatus;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PreAuthorizationRequestRepository extends JpaRepository<PreAuthorizationRequest, Long> {
    List<PreAuthorizationRequest> findByStatus(PreAuthorizationStatus status);

    List<PreAuthorizationRequest> findAllByOrderByIdDesc();

    // Backs the Insurance Claim Report - scoped to APPROVED requests only
    // (a "claim" only exists once a Pre-Authorization is actually approved),
    // filtered by an optional decidedAt range, insurer, and patient UHID.
    @Query("""
            SELECT r FROM PreAuthorizationRequest r
            WHERE r.status = com.pms.insurance.entity.PreAuthorizationStatus.APPROVED
              AND (:from IS NULL OR r.decidedAt >= :from)
              AND (:to IS NULL OR r.decidedAt < :to)
              AND (:insurerName IS NULL OR r.insurerName = :insurerName)
              AND (:patientUhid IS NULL OR r.patient.registrationNumber = :patientUhid)
            ORDER BY r.decidedAt DESC
            """)
    List<PreAuthorizationRequest> findApprovedForReport(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("insurerName") String insurerName,
            @Param("patientUhid") String patientUhid);
}
