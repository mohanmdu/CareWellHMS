package com.pms.registration.repository;

import com.pms.registration.entity.PatientAuditLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientAuditLogRepository extends JpaRepository<PatientAuditLog, Long> {
    List<PatientAuditLog> findAllByOrderByPerformedAtDesc();
}
