package com.pms.labradiology.repository;

import com.pms.labradiology.entity.LabRequisitionItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LabRequisitionItemRepository extends JpaRepository<LabRequisitionItem, Long> {
}
