package com.pms.registration.repository;

import com.pms.registration.entity.PatientReport;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientReportRepository extends JpaRepository<PatientReport, Long> {
    List<PatientReport> findByPatientIdAndDeletedAtIsNullOrderByUploadedAtDesc(Long patientId);

    List<PatientReport> findByPatientIdAndDeletedAtIsNotNullOrderByDeletedAtDesc(Long patientId);

    // Audit logs are historical records of the upload operation, so this
    // intentionally ignores deletedAt - a later delete doesn't erase the
    // fact that the upload happened.
    List<PatientReport> findAllByOrderByUploadedAtDesc();
}
