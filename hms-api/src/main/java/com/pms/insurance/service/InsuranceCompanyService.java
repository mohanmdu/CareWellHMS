package com.pms.insurance.service;

import com.pms.common.EntityNotFoundException;
import com.pms.insurance.dto.InsuranceCompanyDto;
import com.pms.insurance.entity.InsuranceCompany;
import com.pms.insurance.entity.InsuranceCompanyAuditLog;
import com.pms.insurance.repository.InsuranceCompanyAuditLogRepository;
import com.pms.insurance.repository.InsuranceCompanyRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Create/deactivate/restore are written to InsuranceCompanyAuditLog (mirroring
 * RoomTypeService) so the Insurance Companies screen can show who created/
 * deactivated each entry.
 */
@Service
@Transactional(readOnly = true)
public class InsuranceCompanyService {

    private static final String CREATE = "CREATE";
    private static final String UPDATE = "UPDATE";
    private static final String DEACTIVATE = "DEACTIVATE";
    private static final String RESTORE = "RESTORE";

    private final InsuranceCompanyRepository repository;
    private final InsuranceCompanyAuditLogRepository auditLogRepository;

    public InsuranceCompanyService(InsuranceCompanyRepository repository, InsuranceCompanyAuditLogRepository auditLogRepository) {
        this.repository = repository;
        this.auditLogRepository = auditLogRepository;
    }

    public List<InsuranceCompanyDto> findActive() {
        return toDtos(repository.findByActiveTrueOrderByCompanyNameAsc());
    }

    public List<InsuranceCompanyDto> findInactive() {
        return toDtos(repository.findByActiveFalseOrderByUpdatedAtDesc());
    }

    @Transactional
    public InsuranceCompanyDto create(InsuranceCompanyDto dto) {
        if (repository.existsByCompanyNameIgnoreCase(dto.companyName())) {
            throw new IllegalArgumentException("Insurance company already exists: " + dto.companyName());
        }
        InsuranceCompany company = new InsuranceCompany();
        applyFields(company, dto);
        company.setActive(true);
        InsuranceCompany saved = repository.save(company);
        recordAudit(saved, CREATE);
        return toDtos(List.of(saved)).get(0);
    }

    @Transactional
    public InsuranceCompanyDto update(Long id, InsuranceCompanyDto dto) {
        InsuranceCompany company = getOrThrow(id);
        applyFields(company, dto);
        InsuranceCompany saved = repository.save(company);
        recordAudit(saved, UPDATE);
        return toDtos(List.of(saved)).get(0);
    }

    @Transactional
    public void deactivate(Long id) {
        InsuranceCompany company = getOrThrow(id);
        company.setActive(false);
        repository.save(company);
        recordAudit(company, DEACTIVATE);
    }

    @Transactional
    public void restore(Long id) {
        InsuranceCompany company = getOrThrow(id);
        company.setActive(true);
        repository.save(company);
        recordAudit(company, RESTORE);
    }

    private void applyFields(InsuranceCompany company, InsuranceCompanyDto dto) {
        company.setInsuranceType(dto.insuranceType());
        company.setCompanyName(dto.companyName());
    }

    private void recordAudit(InsuranceCompany company, String operation) {
        auditLogRepository.save(
                new InsuranceCompanyAuditLog(company.getId(), company.getCompanyName(), operation, currentUsername()));
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private List<InsuranceCompanyDto> toDtos(List<InsuranceCompany> companies) {
        Map<Long, InsuranceCompanyAuditLog> createdBy = latestByCompany(CREATE);
        Map<Long, InsuranceCompanyAuditLog> updatedBy = latestByCompany(UPDATE);
        Map<Long, InsuranceCompanyAuditLog> deactivatedBy = latestByCompany(DEACTIVATE);
        return companies.stream().map(company -> toDto(company, createdBy, updatedBy, deactivatedBy)).toList();
    }

    /** Most recent log per company for the given operation, keyed by company id. */
    private Map<Long, InsuranceCompanyAuditLog> latestByCompany(String operation) {
        return auditLogRepository.findAllByOperationOrderByPerformedAtDesc(operation).stream()
                .collect(HashMap::new, (map, log) -> map.putIfAbsent(log.getInsuranceCompanyId(), log), HashMap::putAll);
    }

    private InsuranceCompany getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Insurance company not found: " + id));
    }

    private InsuranceCompanyDto toDto(
            InsuranceCompany company,
            Map<Long, InsuranceCompanyAuditLog> createdBy,
            Map<Long, InsuranceCompanyAuditLog> updatedBy,
            Map<Long, InsuranceCompanyAuditLog> deactivatedBy) {
        InsuranceCompanyAuditLog created = createdBy.get(company.getId());
        InsuranceCompanyAuditLog updated = updatedBy.get(company.getId());
        InsuranceCompanyAuditLog deactivated = company.isActive() ? null : deactivatedBy.get(company.getId());
        return new InsuranceCompanyDto(
                company.getId(),
                company.getInsuranceType(),
                company.getCompanyName(),
                company.isActive(),
                company.getCreatedAt(),
                created != null ? created.getPerformedBy() : null,
                company.getUpdatedAt(),
                updated != null ? updated.getPerformedBy() : null,
                deactivated != null ? deactivated.getPerformedAt() : null,
                deactivated != null ? deactivated.getPerformedBy() : null);
    }
}
