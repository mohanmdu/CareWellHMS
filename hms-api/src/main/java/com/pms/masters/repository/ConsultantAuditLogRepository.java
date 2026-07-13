package com.pms.masters.repository;

import com.pms.masters.entity.ConsultantAuditLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsultantAuditLogRepository extends JpaRepository<ConsultantAuditLog, Long> {
    List<ConsultantAuditLog> findAllByOperationOrderByPerformedAtDesc(String operation);
}
