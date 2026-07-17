package com.pms.masters.service;

import com.pms.common.EntityNotFoundException;
import com.pms.masters.dto.IpBillingComponentDto;
import com.pms.masters.entity.IpBillingCategory;
import com.pms.masters.entity.IpBillingComponent;
import com.pms.masters.entity.IpBillingComponentAuditLog;
import com.pms.masters.repository.IpBillingCategoryRepository;
import com.pms.masters.repository.IpBillingComponentAuditLogRepository;
import com.pms.masters.repository.IpBillingComponentRepository;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Create/update/deactivate/restore are written to IpBillingComponentAuditLog
 * with human-readable content/previousContent snapshots, so the Billing
 * Activity Log screen can display them directly with no frontend diffing.
 */
@Service
@Transactional(readOnly = true)
public class IpBillingComponentService {

    private static final String CREATE = "CREATE";
    private static final String UPDATE = "UPDATE";
    private static final String DEACTIVATE = "DEACTIVATE";
    private static final String RESTORE = "RESTORE";

    private final IpBillingComponentRepository repository;
    private final IpBillingCategoryRepository categoryRepository;
    private final IpBillingComponentAuditLogRepository auditLogRepository;

    public IpBillingComponentService(
            IpBillingComponentRepository repository,
            IpBillingCategoryRepository categoryRepository,
            IpBillingComponentAuditLogRepository auditLogRepository) {
        this.repository = repository;
        this.categoryRepository = categoryRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public List<IpBillingComponentDto> findActive() {
        return repository.findByActiveTrueOrderByNameAsc().stream().map(this::toDto).toList();
    }

    public List<IpBillingComponentDto> findInactive() {
        return repository.findByActiveFalseOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public IpBillingComponentDto create(IpBillingComponentDto dto) {
        IpBillingComponent component = new IpBillingComponent();
        applyFields(component, dto);
        component.setActive(true);
        IpBillingComponent saved = repository.save(component);
        recordAudit(saved, CREATE, null, snapshot(saved));
        return toDto(saved);
    }

    @Transactional
    public IpBillingComponentDto update(Long id, IpBillingComponentDto dto) {
        IpBillingComponent component = getOrThrow(id);
        String previousContent = snapshot(component);
        applyFields(component, dto);
        IpBillingComponent saved = repository.save(component);
        recordAudit(saved, UPDATE, previousContent, snapshot(saved));
        return toDto(saved);
    }

    @Transactional
    public void deactivate(Long id) {
        IpBillingComponent component = getOrThrow(id);
        String previousContent = snapshot(component);
        component.setActive(false);
        IpBillingComponent saved = repository.save(component);
        recordAudit(saved, DEACTIVATE, previousContent, snapshot(saved));
    }

    @Transactional
    public void restore(Long id) {
        IpBillingComponent component = getOrThrow(id);
        String previousContent = snapshot(component);
        component.setActive(true);
        IpBillingComponent saved = repository.save(component);
        recordAudit(saved, RESTORE, previousContent, snapshot(saved));
    }

    private void applyFields(IpBillingComponent component, IpBillingComponentDto dto) {
        IpBillingCategory category = categoryRepository.findById(dto.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("IP Billing Category not found: " + dto.categoryId()));
        component.setCategory(category);
        component.setName(dto.name());
        component.setIpAmount(dto.ipAmount());
        component.setInsuranceAmount(dto.insuranceAmount());
    }

    private void recordAudit(IpBillingComponent component, String operation, String previousContent, String content) {
        auditLogRepository.save(new IpBillingComponentAuditLog(
                component.getId(), component.getName(), operation, content, previousContent, currentUsername()));
    }

    private String snapshot(IpBillingComponent component) {
        return "Component: " + component.getName()
                + " | Category: " + component.getCategory().getName()
                + " | IP Amount: " + component.getIpAmount()
                + " | Insurance Amount: " + component.getInsuranceAmount()
                + " | Active: " + component.isActive();
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private IpBillingComponent getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("IP Billing Component not found: " + id));
    }

    private IpBillingComponentDto toDto(IpBillingComponent component) {
        return new IpBillingComponentDto(
                component.getId(),
                component.getCategory().getId(),
                component.getCategory().getName(),
                component.getName(),
                component.getIpAmount(),
                component.getInsuranceAmount(),
                component.isActive());
    }
}
