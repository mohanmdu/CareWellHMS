package com.pms.ipadmission.repository;

import com.pms.ipadmission.entity.AdmissionRoomHistory;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdmissionRoomHistoryRepository extends JpaRepository<AdmissionRoomHistory, Long> {
    List<AdmissionRoomHistory> findByAdmissionIdOrderByFromDateAsc(Long admissionId);

    Optional<AdmissionRoomHistory> findByAdmissionIdAndToDateIsNull(Long admissionId);
}
