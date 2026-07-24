package com.pms.reporting.service;

import com.pms.ipadmission.entity.RoomStatus;
import com.pms.ipadmission.repository.AdmissionRepository;
import com.pms.ipadmission.repository.RoomRepository;
import com.pms.reporting.dto.CeoIpSummaryDto;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * CEO/MD Dashboard's IP Dashboard quadrant. Bed occupancy is a live snapshot
 * (no historical occupancy tracking exists in this schema) - it does not
 * change with fromDate/toDate, unlike patientsAdmitted/patientsDischarged.
 */
@Service
@Transactional(readOnly = true)
public class CeoIpSummaryService {

    private final RoomRepository roomRepository;
    private final AdmissionRepository admissionRepository;

    public CeoIpSummaryService(RoomRepository roomRepository, AdmissionRepository admissionRepository) {
        this.roomRepository = roomRepository;
        this.admissionRepository = admissionRepository;
    }

    public CeoIpSummaryDto summary(LocalDate fromDate, LocalDate toDate) {
        long bedsTotal = roomRepository.countByActiveTrue();
        long bedsOccupied = roomRepository.countByStatusAndActiveTrue(RoomStatus.ALLOCATED);

        LocalDateTime from = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime to = toDate != null ? toDate.plusDays(1).atStartOfDay() : null;
        long patientsAdmitted = admissionRepository.countForAdmissionReport(from, to);
        long patientsDischarged = admissionRepository.countDischargedForList(from, to);

        return new CeoIpSummaryDto(bedsTotal, bedsOccupied, patientsAdmitted, patientsDischarged, Instant.now());
    }
}
