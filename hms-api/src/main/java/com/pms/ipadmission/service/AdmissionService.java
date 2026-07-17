package com.pms.ipadmission.service;

import com.pms.common.EntityNotFoundException;
import com.pms.ipadmission.dto.AdmissionDto;
import com.pms.ipadmission.entity.Admission;
import com.pms.ipadmission.entity.AdmissionStatus;
import com.pms.ipadmission.entity.Room;
import com.pms.ipadmission.entity.RoomStatus;
import com.pms.ipadmission.repository.AdmissionRepository;
import com.pms.ipadmission.repository.RoomRepository;
import com.pms.registration.entity.Patient;
import com.pms.registration.repository.PatientRepository;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Replaces IPAction.createIPAdmission / patientAdvanceRequest(Confirm) /
 * IpDischargeInputBydate / finalizeDischarge / getDetailForIPRefund /
 * balanceRefundUpdate (migration doc §4.2, risk R9). The legacy
 * finalizeDischarge ran raw string-concatenated HQL bulk updates with a
 * race-prone max()-based ID sequence; this uses parameterized JPA
 * operations and a signed settlementAmount instead of separate
 * refund/balance-due code paths.
 */
@Service
@Transactional(readOnly = true)
public class AdmissionService {

    private final AdmissionRepository repository;
    private final PatientRepository patientRepository;
    private final RoomRepository roomRepository;
    private final AtomicInteger sequence = new AtomicInteger(0);

    public AdmissionService(AdmissionRepository repository, PatientRepository patientRepository, RoomRepository roomRepository) {
        this.repository = repository;
        this.patientRepository = patientRepository;
        this.roomRepository = roomRepository;
        this.sequence.set((int) repository.count());
    }

    public List<AdmissionDto> findAll() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public AdmissionDto admit(AdmissionDto dto) {
        Patient patient = patientRepository.findById(dto.patientId())
                .orElseThrow(() -> new EntityNotFoundException("Patient not found: " + dto.patientId()));
        Room room = roomRepository.findById(dto.roomId())
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + dto.roomId()));
        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new IllegalArgumentException("Room " + room.getRoomNumber() + " is not available");
        }

        Admission admission = new Admission();
        admission.setAdmissionNumber(nextAdmissionNumber());
        admission.setPatient(patient);
        admission.setRoom(room);
        admission.setAdmissionDate(LocalDateTime.now());
        admission.setStatus(AdmissionStatus.ADMITTED);
        admission.setAdvanceAmount(0);

        room.setStatus(RoomStatus.ALLOCATED);
        roomRepository.save(room);

        return toDto(repository.save(admission));
    }

    @Transactional
    public AdmissionDto addAdvancePayment(Long id, double amount) {
        Admission admission = getOrThrow(id);
        requireAdmitted(admission);
        admission.setAdvanceAmount(admission.getAdvanceAmount() + amount);
        return toDto(repository.save(admission));
    }

    @Transactional
    public AdmissionDto discharge(Long id, double totalBilled, String dischargeSummary) {
        Admission admission = getOrThrow(id);
        requireAdmitted(admission);

        admission.setStatus(AdmissionStatus.DISCHARGED);
        admission.setDischargeDate(LocalDateTime.now());
        admission.setDischargeSummary(dischargeSummary);
        admission.setTotalBilled(totalBilled);
        // Positive = refund owed to patient; negative = balance due from patient.
        admission.setSettlementAmount(admission.getAdvanceAmount() - totalBilled);

        Room room = admission.getRoom();
        room.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room);

        return toDto(repository.save(admission));
    }

    private void requireAdmitted(Admission admission) {
        if (admission.getStatus() != AdmissionStatus.ADMITTED) {
            throw new IllegalArgumentException("Admission " + admission.getAdmissionNumber() + " is already discharged");
        }
    }

    private String nextAdmissionNumber() {
        return "ADM-" + Year.now().getValue() + "-" + String.format("%05d", sequence.incrementAndGet());
    }

    private Admission getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Admission not found: " + id));
    }

    private AdmissionDto toDto(Admission admission) {
        Patient patient = admission.getPatient();
        Room room = admission.getRoom();
        return new AdmissionDto(
                admission.getId(),
                admission.getAdmissionNumber(),
                patient.getId(),
                (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim(),
                room.getId(),
                room.getRoomNumber(),
                room.getRoomType().getName(),
                admission.getAdmissionDate(),
                admission.getStatus(),
                admission.getAdvanceAmount(),
                admission.getTotalBilled(),
                admission.getSettlementAmount(),
                admission.getDischargeDate(),
                admission.getDischargeSummary());
    }
}
