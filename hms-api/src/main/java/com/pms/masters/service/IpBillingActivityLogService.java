package com.pms.masters.service;

import com.pms.masters.dto.IpBillingActivityLogDto;
import com.pms.masters.entity.IpBillingComponentAuditLog;
import com.pms.masters.repository.IpBillingComponentAuditLogRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class IpBillingActivityLogService {

    private final IpBillingComponentAuditLogRepository repository;

    public IpBillingActivityLogService(IpBillingComponentAuditLogRepository repository) {
        this.repository = repository;
    }

    public List<IpBillingActivityLogDto> search(Instant fromInstant, Instant toInstant) {
        return repository.search(fromInstant, toInstant).stream().map(this::toDto).toList();
    }

    private IpBillingActivityLogDto toDto(IpBillingComponentAuditLog log) {
        return new IpBillingActivityLogDto(
                log.getId(),
                log.getComponentId(),
                log.getComponentName(),
                log.getOperation(),
                log.getContent(),
                log.getPreviousContent(),
                log.getPerformedBy(),
                log.getPerformedAt());
    }
}
