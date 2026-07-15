package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.PharmacyRequest;
import com.pms.pharmacy.entity.PharmacyRequestStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PharmacyRequestRepository extends JpaRepository<PharmacyRequest, Long> {
    List<PharmacyRequest> findByStatusOrderByCreatedAtDesc(PharmacyRequestStatus status);

    List<PharmacyRequest> findByPatientIdAndStatusOrderByCreatedAtDesc(Long patientId, PharmacyRequestStatus status);
}
