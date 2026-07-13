package com.pms.masters.service;

import com.pms.common.EntityNotFoundException;
import com.pms.masters.dto.DepartmentDto;
import com.pms.masters.entity.Department;
import com.pms.masters.entity.DepartmentAuditLog;
import com.pms.masters.repository.ConsultantRepository;
import com.pms.masters.repository.DepartmentAuditLogRepository;
import com.pms.masters.repository.DepartmentRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Replaces AdminAction.getDepartmentDetails / addDepartment / deptEditDetails /
 * deptUpdateDetails / deptDeactivateDetails (see migration doc §4.6 / §5).
 *
 * Create/deactivate/restore are written to DepartmentAuditLog (mirroring
 * PatientService) so the list screen can show who created/deactivated each
 * department, attributed to the authenticated principal where auth is
 * enabled, "system" otherwise.
 */
@Service
@Transactional(readOnly = true)
public class DepartmentService {

    private static final String CREATE = "CREATE";
    private static final String DEACTIVATE = "DEACTIVATE";
    private static final String RESTORE = "RESTORE";

    private final DepartmentRepository repository;
    private final DepartmentAuditLogRepository auditLogRepository;
    private final ConsultantRepository consultantRepository;

    public DepartmentService(
            DepartmentRepository repository,
            DepartmentAuditLogRepository auditLogRepository,
            ConsultantRepository consultantRepository) {
        this.repository = repository;
        this.auditLogRepository = auditLogRepository;
        this.consultantRepository = consultantRepository;
    }

    public List<DepartmentDto> findActive() {
        return toDtos(repository.findByActiveTrueOrderByNameAsc());
    }

    public List<DepartmentDto> findInactive() {
        return toDtos(repository.findByActiveFalseOrderByUpdatedAtDesc());
    }

    public DepartmentDto findById(Long id) {
        return toDto(getOrThrow(id), latestByDepartment(CREATE), latestByDepartment(DEACTIVATE));
    }

    @Transactional
    public DepartmentDto create(DepartmentDto dto) {
        if (repository.existsByNameIgnoreCase(dto.name())) {
            throw new IllegalArgumentException("Department already exists: " + dto.name());
        }
        Department department = new Department();
        department.setName(dto.name());
        department.setActive(true);
        Department saved = repository.save(department);
        recordAudit(saved, CREATE);
        return findById(saved.getId());
    }

    @Transactional
    public DepartmentDto update(Long id, DepartmentDto dto) {
        Department department = getOrThrow(id);
        department.setName(dto.name());
        Department saved = repository.save(department);
        return findById(saved.getId());
    }

    @Transactional
    public void deactivate(Long id) {
        Department department = getOrThrow(id);
        department.setActive(false);
        repository.save(department);
        recordAudit(department, DEACTIVATE);
    }

    @Transactional
    public void restore(Long id) {
        Department department = getOrThrow(id);
        department.setActive(true);
        repository.save(department);
        recordAudit(department, RESTORE);
    }

    private void recordAudit(Department department, String operation) {
        auditLogRepository.save(
                new DepartmentAuditLog(department.getId(), department.getName(), operation, currentUsername()));
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private List<DepartmentDto> toDtos(List<Department> departments) {
        Map<Long, DepartmentAuditLog> createdBy = latestByDepartment(CREATE);
        Map<Long, DepartmentAuditLog> deactivatedBy = latestByDepartment(DEACTIVATE);
        return departments.stream().map(department -> toDto(department, createdBy, deactivatedBy)).toList();
    }

    /** Most recent log per department for the given operation, keyed by department id. */
    private Map<Long, DepartmentAuditLog> latestByDepartment(String operation) {
        return auditLogRepository.findAllByOperationOrderByPerformedAtDesc(operation).stream()
                .collect(HashMap::new, (map, log) -> map.putIfAbsent(log.getDepartmentId(), log), HashMap::putAll);
    }

    private Department getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Department not found: " + id));
    }

    private DepartmentDto toDto(
            Department department, Map<Long, DepartmentAuditLog> createdBy, Map<Long, DepartmentAuditLog> deactivatedBy) {
        DepartmentAuditLog created = createdBy.get(department.getId());
        DepartmentAuditLog deactivated = department.isActive() ? null : deactivatedBy.get(department.getId());
        long consultantCount = consultantRepository.countByDepartmentId(department.getId());
        return new DepartmentDto(
                department.getId(),
                department.getName(),
                department.isActive(),
                department.getCreatedAt(),
                created != null ? created.getPerformedBy() : null,
                deactivated != null ? deactivated.getPerformedAt() : null,
                deactivated != null ? deactivated.getPerformedBy() : null,
                consultantCount);
    }
}
