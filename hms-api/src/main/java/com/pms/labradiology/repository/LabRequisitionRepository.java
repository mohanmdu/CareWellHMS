package com.pms.labradiology.repository;

import com.pms.labradiology.entity.LabRequisition;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LabRequisitionRepository extends JpaRepository<LabRequisition, Long> {
}
