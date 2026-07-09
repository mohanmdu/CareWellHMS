package com.pms.ipadmission.repository;

import com.pms.ipadmission.entity.Admission;
import com.pms.ipadmission.entity.AdmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdmissionRepository extends JpaRepository<Admission, Long> {
    long countByStatus(AdmissionStatus status);
}
