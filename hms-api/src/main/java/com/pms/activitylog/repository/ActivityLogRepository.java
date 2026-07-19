package com.pms.activitylog.repository;

import com.pms.activitylog.entity.ActivityLog;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    @Query("""
            SELECT l FROM ActivityLog l
            WHERE (:fromInstant IS NULL OR l.performedAt >= :fromInstant)
              AND (:toInstant IS NULL OR l.performedAt < :toInstant)
              AND (:patientUhid IS NULL OR LOWER(l.patientUhid) LIKE LOWER(CONCAT('%', :patientUhid, '%')))
              AND (:patientName IS NULL OR LOWER(l.patientName) LIKE LOWER(CONCAT('%', :patientName, '%')))
              AND (:opNumber IS NULL OR LOWER(l.opNumber) LIKE LOWER(CONCAT('%', :opNumber, '%')))
              AND (:ipNumber IS NULL OR LOWER(l.ipNumber) LIKE LOWER(CONCAT('%', :ipNumber, '%')))
              AND (:module IS NULL OR l.module = :module)
              AND (:operation IS NULL OR l.operation = :operation)
              AND (:performedBy IS NULL OR LOWER(l.performedBy) LIKE LOWER(CONCAT('%', :performedBy, '%')))
              AND (:status IS NULL OR l.status = :status)
            ORDER BY l.performedAt DESC
            """)
    List<ActivityLog> search(
            @Param("fromInstant") Instant fromInstant,
            @Param("toInstant") Instant toInstant,
            @Param("patientUhid") String patientUhid,
            @Param("patientName") String patientName,
            @Param("opNumber") String opNumber,
            @Param("ipNumber") String ipNumber,
            @Param("module") String module,
            @Param("operation") String operation,
            @Param("performedBy") String performedBy,
            @Param("status") String status);
}
