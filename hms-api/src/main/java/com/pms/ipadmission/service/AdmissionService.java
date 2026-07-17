package com.pms.ipadmission.service;

import com.pms.common.EntityNotFoundException;
import com.pms.common.FileStorageService;
import com.pms.ipadmission.dto.AdmissionDto;
import com.pms.ipadmission.entity.Admission;
import com.pms.ipadmission.entity.AdmissionStatus;
import com.pms.ipadmission.entity.Room;
import com.pms.ipadmission.entity.RoomStatus;
import com.pms.ipadmission.entity.RoomType;
import com.pms.ipadmission.repository.AdmissionRepository;
import com.pms.ipadmission.repository.RoomRepository;
import com.pms.ipadmission.repository.RoomTypeRepository;
import com.pms.registration.entity.Patient;
import com.pms.registration.repository.PatientRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Replaces IPAction.createIPAdmission / patientAdvanceRequest(Confirm) /
 * IpDischargeInputBydate / finalizeDischarge / getDetailForIPRefund /
 * balanceRefundUpdate (migration doc §4.2, risk R9). The legacy
 * finalizeDischarge ran raw string-concatenated HQL bulk updates with a
 * race-prone max()-based ID sequence; this uses parameterized JPA
 * operations and a signed settlementAmount instead of separate
 * refund/balance-due code paths.
 *
 * register() is the new two-step flow's Step 1 (Casualty/Emergency Admission
 * batch): captures intake details and a room *type* preference only, no room
 * assigned yet. admit() remains the older direct single-step path (room
 * required upfront) used by the existing AdmissionWorklistComponent until
 * Ward Allocation (a later batch) replaces it.
 */
@Service
@Transactional(readOnly = true)
public class AdmissionService {

    private final AdmissionRepository repository;
    private final PatientRepository patientRepository;
    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final FileStorageService fileStorageService;
    private final AtomicInteger sequence = new AtomicInteger(0);

    public AdmissionService(
            AdmissionRepository repository,
            PatientRepository patientRepository,
            RoomRepository roomRepository,
            RoomTypeRepository roomTypeRepository,
            FileStorageService fileStorageService) {
        this.repository = repository;
        this.patientRepository = patientRepository;
        this.roomRepository = roomRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.fileStorageService = fileStorageService;
        this.sequence.set((int) repository.count());
    }

    public List<AdmissionDto> findAll() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    public AdmissionDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    @Transactional
    public AdmissionDto admit(AdmissionDto dto) {
        if (dto.roomId() == null) {
            throw new IllegalArgumentException("Room is required to admit a patient directly");
        }
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

    /** Step 1 of the Casualty/Emergency Admission flow: intake + room-type preference, no bed assigned yet. */
    @Transactional
    public AdmissionDto register(AdmissionDto dto) {
        Patient patient = patientRepository.findById(dto.patientId())
                .orElseThrow(() -> new EntityNotFoundException("Patient not found: " + dto.patientId()));

        Admission admission = new Admission();
        admission.setAdmissionNumber(nextAdmissionNumber());
        admission.setPatient(patient);
        admission.setRoomType(resolveRoomType(dto.roomTypeId()));
        admission.setAdmissionDate(dto.admissionDate() != null ? dto.admissionDate() : LocalDateTime.now());
        admission.setStatus(AdmissionStatus.REGISTERED);
        admission.setAdvanceAmount(0);
        applyIntakeFields(admission, dto);

        return toDto(repository.save(admission));
    }

    @Transactional
    public AdmissionDto uploadPhoto(Long id, MultipartFile file) {
        Admission admission = getOrThrow(id);
        String photoPath = fileStorageService.store(file, "admissions");
        admission.setPhotoPath(photoPath);
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

    private void applyIntakeFields(Admission admission, AdmissionDto dto) {
        admission.setAttenderName(dto.attenderName());
        admission.setRelationType(dto.relationType());
        admission.setFatherSpouseName(dto.fatherSpouseName());
        admission.setRelationMobileNo(dto.relationMobileNo());
        admission.setOccupation(dto.occupation());
        admission.setMaritalStatus(dto.maritalStatus());
        admission.setPeriodOfStayDays(dto.periodOfStayDays());
        admission.setDescriptionOfCase(dto.descriptionOfCase());
        admission.setReferralDoctor(dto.referralDoctor());
        admission.setPrimaryConsultant(dto.primaryConsultant());
        admission.setSecondaryConsultant(dto.secondaryConsultant());
        admission.setPaymentType(dto.paymentType());
        admission.setHeightCm(dto.heightCm());
        admission.setWeightKg(dto.weightKg());
        admission.setMlc(dto.mlc() != null && dto.mlc());
        admission.setInsuranceType(dto.insuranceType());
        admission.setPatientType(dto.patientType());
        admission.setRemarks(dto.remarks());
        admission.setAadhaarNumber(dto.aadhaarNumber());
        admission.setVentilatorRequired(dto.ventilatorRequired() != null && dto.ventilatorRequired());
        admission.setMonitorRequired(dto.monitorRequired() != null && dto.monitorRequired());
    }

    private RoomType resolveRoomType(Long roomTypeId) {
        if (roomTypeId == null) {
            return null;
        }
        return roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new EntityNotFoundException("Room type not found: " + roomTypeId));
    }

    private void requireAdmitted(Admission admission) {
        if (admission.getStatus() != AdmissionStatus.ADMITTED) {
            throw new IllegalArgumentException("Admission " + admission.getAdmissionNumber() + " is already discharged");
        }
    }

    private String nextAdmissionNumber() {
        return "IP" + String.format("%06d", sequence.incrementAndGet());
    }

    private Admission getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Admission not found: " + id));
    }

    private AdmissionDto toDto(Admission admission) {
        Patient patient = admission.getPatient();
        Room room = admission.getRoom();
        RoomType roomType = admission.getRoomType();
        return new AdmissionDto(
                admission.getId(),
                admission.getAdmissionNumber(),
                patient.getId(),
                (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim(),
                room != null ? room.getId() : null,
                room != null ? room.getRoomNumber() : null,
                roomType != null ? roomType.getId() : (room != null ? room.getRoomType().getId() : null),
                roomType != null ? roomType.getName() : (room != null ? room.getRoomType().getName() : null),
                admission.getAdmissionDate(),
                admission.getStatus(),
                admission.getAdvanceAmount(),
                admission.getTotalBilled(),
                admission.getSettlementAmount(),
                admission.getDischargeDate(),
                admission.getDischargeSummary(),
                admission.getAttenderName(),
                admission.getRelationType(),
                admission.getFatherSpouseName(),
                admission.getRelationMobileNo(),
                admission.getOccupation(),
                admission.getMaritalStatus(),
                admission.getPeriodOfStayDays(),
                admission.getDescriptionOfCase(),
                admission.getReferralDoctor(),
                admission.getPrimaryConsultant(),
                admission.getSecondaryConsultant(),
                admission.getPaymentType(),
                admission.getHeightCm(),
                admission.getWeightKg(),
                admission.isMlc(),
                admission.getInsuranceType(),
                admission.getPatientType(),
                admission.getRemarks(),
                admission.getAadhaarNumber(),
                admission.isVentilatorRequired(),
                admission.isMonitorRequired(),
                admission.getPhotoPath());
    }
}
