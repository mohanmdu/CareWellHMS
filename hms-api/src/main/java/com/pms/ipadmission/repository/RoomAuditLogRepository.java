package com.pms.ipadmission.repository;

import com.pms.ipadmission.entity.RoomAuditLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomAuditLogRepository extends JpaRepository<RoomAuditLog, Long> {
    List<RoomAuditLog> findAllByOperationOrderByPerformedAtDesc(String operation);
}
