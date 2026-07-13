package com.pms.registration.repository;

import com.pms.registration.entity.AppointmentAuditLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentAuditLogRepository extends JpaRepository<AppointmentAuditLog, Long> {
    List<AppointmentAuditLog> findAllByOrderByPerformedAtDesc();
}
