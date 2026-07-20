package com.pms.lab.repository;

import com.pms.lab.entity.LabRequisition;
import com.pms.lab.entity.LabRequisitionStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LabRequisitionRepository extends JpaRepository<LabRequisition, Long> {
    List<LabRequisition> findByStatusOrderByRequisitionDateDesc(LabRequisitionStatus status);

    // Requisition numbers are fixed-width (LABREQ00001), so lexicographic and
    // numeric ordering agree - mirrors PatientService.nextRegistrationNumber's
    // derive-from-the-table approach rather than a row count.
    Optional<LabRequisition> findTopByRequisitionNumberStartingWithOrderByRequisitionNumberDesc(String prefix);

    @Query("SELECT MAX(r.invoiceNumber) FROM LabRequisition r")
    Long findMaxInvoiceNumber();
}
