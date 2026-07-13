package com.pms.masters.service;

import com.pms.common.EntityNotFoundException;
import com.pms.common.FileStorageService;
import com.pms.masters.dto.ConsultantDto;
import com.pms.masters.entity.Consultant;
import com.pms.masters.entity.ConsultantAuditLog;
import com.pms.masters.entity.Department;
import com.pms.masters.entity.Specialization;
import com.pms.masters.repository.ConsultantAuditLogRepository;
import com.pms.masters.repository.ConsultantRepository;
import com.pms.masters.repository.DepartmentRepository;
import com.pms.masters.repository.SpecializationRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Create/update/deactivate/restore are written to ConsultantAuditLog
 * (mirroring DepartmentService) so the list screen can show who
 * created/last edited/deactivated each consultant.
 */
@Service
@Transactional(readOnly = true)
public class ConsultantService {

    private static final String CREATE = "CREATE";
    private static final String UPDATE = "UPDATE";
    private static final String DEACTIVATE = "DEACTIVATE";
    private static final String RESTORE = "RESTORE";

    private final ConsultantRepository repository;
    private final DepartmentRepository departmentRepository;
    private final SpecializationRepository specializationRepository;
    private final ConsultantAuditLogRepository auditLogRepository;
    private final FileStorageService fileStorageService;

    public ConsultantService(
            ConsultantRepository repository,
            DepartmentRepository departmentRepository,
            SpecializationRepository specializationRepository,
            ConsultantAuditLogRepository auditLogRepository,
            FileStorageService fileStorageService) {
        this.repository = repository;
        this.departmentRepository = departmentRepository;
        this.specializationRepository = specializationRepository;
        this.auditLogRepository = auditLogRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<ConsultantDto> findActive() {
        return toDtos(repository.findByActiveTrueOrderByNameAsc());
    }

    public List<ConsultantDto> findInactive() {
        return toDtos(repository.findByActiveFalseOrderByUpdatedAtDesc());
    }

    public ConsultantDto findById(Long id) {
        return toDto(getOrThrow(id), latestByConsultant(CREATE), latestByConsultant(UPDATE), latestByConsultant(DEACTIVATE));
    }

    @Transactional
    public ConsultantDto create(ConsultantDto dto) {
        Consultant consultant = new Consultant();
        applyFields(consultant, dto);
        consultant.setActive(true);
        Consultant saved = repository.save(consultant);
        recordAudit(saved, CREATE);
        return findById(saved.getId());
    }

    @Transactional
    public ConsultantDto update(Long id, ConsultantDto dto) {
        Consultant consultant = getOrThrow(id);
        applyFields(consultant, dto);
        Consultant saved = repository.save(consultant);
        recordAudit(saved, UPDATE);
        return findById(saved.getId());
    }

    @Transactional
    public void deactivate(Long id) {
        Consultant consultant = getOrThrow(id);
        consultant.setActive(false);
        repository.save(consultant);
        recordAudit(consultant, DEACTIVATE);
    }

    @Transactional
    public void restore(Long id) {
        Consultant consultant = getOrThrow(id);
        consultant.setActive(true);
        repository.save(consultant);
        recordAudit(consultant, RESTORE);
    }

    @Transactional
    public ConsultantDto uploadImage(Long id, MultipartFile file) {
        Consultant consultant = getOrThrow(id);
        String imagePath = fileStorageService.store(file, "consultants");
        consultant.setImagePath(imagePath);
        Consultant saved = repository.save(consultant);
        return findById(saved.getId());
    }

    private void applyFields(Consultant consultant, ConsultantDto dto) {
        Department department = departmentRepository.findById(dto.departmentId())
                .orElseThrow(() -> new EntityNotFoundException("Department not found: " + dto.departmentId()));
        consultant.setName(dto.name());
        consultant.setDepartment(department);
        consultant.setSpecialization(resolveSpecialization(dto.specializationId()));
        consultant.setEmail(dto.email());
        consultant.setMobileNumber(dto.mobileNumber());
        consultant.setConsultationFee(dto.consultationFee() != null ? dto.consultationFee() : 0.0);
        consultant.setProfile(dto.profile());
        consultant.setAddress(dto.address());
        consultant.setAcceptingAppointments(dto.acceptingAppointments() == null || dto.acceptingAppointments());
    }

    private Specialization resolveSpecialization(Long specializationId) {
        if (specializationId == null) {
            return null;
        }
        return specializationRepository.findById(specializationId)
                .orElseThrow(() -> new EntityNotFoundException("Specialization not found: " + specializationId));
    }

    private void recordAudit(Consultant consultant, String operation) {
        auditLogRepository.save(
                new ConsultantAuditLog(consultant.getId(), consultant.getName(), operation, currentUsername()));
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private List<ConsultantDto> toDtos(List<Consultant> consultants) {
        Map<Long, ConsultantAuditLog> createdBy = latestByConsultant(CREATE);
        Map<Long, ConsultantAuditLog> updatedBy = latestByConsultant(UPDATE);
        Map<Long, ConsultantAuditLog> deactivatedBy = latestByConsultant(DEACTIVATE);
        return consultants.stream().map(consultant -> toDto(consultant, createdBy, updatedBy, deactivatedBy)).toList();
    }

    /** Most recent log per consultant for the given operation, keyed by consultant id. */
    private Map<Long, ConsultantAuditLog> latestByConsultant(String operation) {
        return auditLogRepository.findAllByOperationOrderByPerformedAtDesc(operation).stream()
                .collect(HashMap::new, (map, log) -> map.putIfAbsent(log.getConsultantId(), log), HashMap::putAll);
    }

    private Consultant getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Consultant not found: " + id));
    }

    private ConsultantDto toDto(
            Consultant consultant,
            Map<Long, ConsultantAuditLog> createdBy,
            Map<Long, ConsultantAuditLog> updatedBy,
            Map<Long, ConsultantAuditLog> deactivatedBy) {
        ConsultantAuditLog created = createdBy.get(consultant.getId());
        ConsultantAuditLog updated = updatedBy.get(consultant.getId());
        ConsultantAuditLog deactivated = consultant.isActive() ? null : deactivatedBy.get(consultant.getId());
        Specialization specialization = consultant.getSpecialization();
        return new ConsultantDto(
                consultant.getId(),
                consultant.getName(),
                consultant.getDepartment().getId(),
                consultant.getDepartment().getName(),
                specialization != null ? specialization.getId() : null,
                specialization != null ? specialization.getName() : null,
                consultant.getEmail(),
                consultant.getMobileNumber(),
                consultant.getConsultationFee(),
                consultant.getProfile(),
                consultant.getAddress(),
                consultant.isAcceptingAppointments(),
                consultant.getImagePath(),
                consultant.isActive(),
                consultant.getCreatedAt(),
                created != null ? created.getPerformedBy() : null,
                updated != null ? updated.getPerformedAt() : null,
                updated != null ? updated.getPerformedBy() : null,
                deactivated != null ? deactivated.getPerformedAt() : null,
                deactivated != null ? deactivated.getPerformedBy() : null);
    }
}
