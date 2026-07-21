package com.pms.insurance.repository;

import com.pms.insurance.entity.InsuranceCompanyAuditLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InsuranceCompanyAuditLogRepository extends JpaRepository<InsuranceCompanyAuditLog, Long> {
    List<InsuranceCompanyAuditLog> findAllByOperationOrderByPerformedAtDesc(String operation);
}
