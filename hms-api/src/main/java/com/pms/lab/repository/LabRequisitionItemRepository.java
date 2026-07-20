package com.pms.lab.repository;

import com.pms.lab.entity.LabRequisitionItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LabRequisitionItemRepository extends JpaRepository<LabRequisitionItem, Long> {
    List<LabRequisitionItem> findByRequisitionId(Long requisitionId);
}
