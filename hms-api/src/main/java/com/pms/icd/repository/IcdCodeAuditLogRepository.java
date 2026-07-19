package com.pms.icd.repository;

import com.pms.icd.entity.IcdCodeAuditLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IcdCodeAuditLogRepository extends JpaRepository<IcdCodeAuditLog, Long> {
    List<IcdCodeAuditLog> findAllByOperationOrderByPerformedAtDesc(String operation);
}
