package com.pms.dischargesummary.repository;

import com.pms.dischargesummary.entity.DischargeSummary;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DischargeSummaryRepository extends JpaRepository<DischargeSummary, Long> {
    Optional<DischargeSummary> findByAdmissionId(Long admissionId);
}
