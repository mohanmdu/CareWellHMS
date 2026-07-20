package com.pms.lab.repository;

import com.pms.lab.entity.LabTestResult;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LabTestResultRepository extends JpaRepository<LabTestResult, Long> {
    List<LabTestResult> findByLabTestEntryId(Long labTestEntryId);
}
