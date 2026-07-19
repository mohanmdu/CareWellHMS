package com.pms.icd.repository;

import com.pms.icd.entity.PatientDiagnosis;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientDiagnosisRepository extends JpaRepository<PatientDiagnosis, Long> {
    List<PatientDiagnosis> findByPatientIdAndActiveTrueOrderByDiagnosisDateDesc(Long patientId);
}
