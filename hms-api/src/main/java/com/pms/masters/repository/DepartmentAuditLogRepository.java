package com.pms.masters.repository;

import com.pms.masters.entity.DepartmentAuditLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentAuditLogRepository extends JpaRepository<DepartmentAuditLog, Long> {
    List<DepartmentAuditLog> findAllByOperationOrderByPerformedAtDesc(String operation);
}
