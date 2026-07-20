package com.pms.lab.repository;

import com.pms.lab.entity.LabTestEntry;
import com.pms.lab.entity.LabTestEntryStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LabTestEntryRepository extends JpaRepository<LabTestEntry, Long> {
    List<LabTestEntry> findByStatusInOrderByCreatedAtDesc(List<LabTestEntryStatus> statuses);

    List<LabTestEntry> findByStatusOrderByApprovedAtDesc(LabTestEntryStatus status);

    Optional<LabTestEntry> findByRequisitionId(Long requisitionId);
}
