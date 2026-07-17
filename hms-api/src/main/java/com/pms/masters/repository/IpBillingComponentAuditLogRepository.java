package com.pms.masters.repository;

import com.pms.masters.entity.IpBillingComponentAuditLog;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IpBillingComponentAuditLogRepository extends JpaRepository<IpBillingComponentAuditLog, Long> {

    @Query("""
            SELECT l FROM IpBillingComponentAuditLog l
            WHERE (:fromInstant IS NULL OR l.performedAt >= :fromInstant)
              AND (:toInstant IS NULL OR l.performedAt < :toInstant)
            ORDER BY l.performedAt DESC
            """)
    List<IpBillingComponentAuditLog> search(@Param("fromInstant") Instant fromInstant, @Param("toInstant") Instant toInstant);
}
