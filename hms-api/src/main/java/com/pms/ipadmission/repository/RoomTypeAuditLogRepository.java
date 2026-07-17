package com.pms.ipadmission.repository;

import com.pms.ipadmission.entity.RoomTypeAuditLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomTypeAuditLogRepository extends JpaRepository<RoomTypeAuditLog, Long> {
    List<RoomTypeAuditLog> findAllByOperationOrderByPerformedAtDesc(String operation);
}
