package com.pms.activitylog.service;

import com.pms.activitylog.dto.ActivityLogDto;
import com.pms.activitylog.entity.ActivityLog;
import com.pms.activitylog.repository.ActivityLogRepository;
import com.pms.common.EntityNotFoundException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * IP/OP Billing Activity Log ("IP/OP Tracking Report"): a shared write API
 * (log()) that other services call right after a real business action, plus
 * the read side (search/findById) behind the audit screen. Every write is
 * its own transaction and never throws past the caller - a logging failure
 * must never roll back or block the actual business operation it's recording.
 */
@Service
public class ActivityLogService {

    private static final Logger LOG = LoggerFactory.getLogger(ActivityLogService.class);

    private final ActivityLogRepository repository;

    public ActivityLogService(ActivityLogRepository repository) {
        this.repository = repository;
    }

    /**
     * Swallows and logs any failure instead of propagating it - callers
     * invoke this from inside their own @Transactional business method
     * (register/admit/addLineItem/approve/...), and an audit-trail write
     * failure must never roll back or block the real operation it records.
     */
    @Transactional
    public void log(ActivityLogEntry entry) {
        try {
            ActivityLog log = new ActivityLog();
            log.setModule(entry.module());
            log.setOperation(entry.operation());
            log.setContent(entry.content());
            log.setPreviousContent(entry.previousContent());
            log.setStatus(entry.status());
            log.setPatientUhid(entry.patientUhid());
            log.setPatientName(entry.patientName());
            log.setOpNumber(entry.opNumber());
            log.setIpNumber(entry.ipNumber());
            log.setScreenName(entry.screenName());
            log.setRemarks(entry.remarks());
            log.setPerformedBy(currentUsername());
            log.setPerformedAt(Instant.now());
            repository.save(log);
        } catch (RuntimeException e) {
            LOG.warn("Failed to write activity log entry for {}/{}", entry.module(), entry.operation(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<ActivityLogDto> search(
            LocalDate fromDate,
            LocalDate toDate,
            String patientUhid,
            String patientName,
            String opNumber,
            String ipNumber,
            String module,
            String operation,
            String performedBy,
            String status) {
        Instant fromInstant = fromDate != null ? fromDate.atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        Instant toInstant = toDate != null ? toDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        return repository
                .search(
                        fromInstant,
                        toInstant,
                        blankToNull(patientUhid),
                        blankToNull(patientName),
                        blankToNull(opNumber),
                        blankToNull(ipNumber),
                        blankToNull(module),
                        blankToNull(operation),
                        blankToNull(performedBy),
                        blankToNull(status))
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ActivityLogDto findById(Long id) {
        return repository.findById(id).map(this::toDto).orElseThrow(() -> new EntityNotFoundException("Activity log not found: " + id));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private ActivityLogDto toDto(ActivityLog log) {
        return new ActivityLogDto(
                log.getId(),
                log.getPatientUhid(),
                log.getPatientName(),
                log.getOpNumber(),
                log.getIpNumber(),
                log.getModule(),
                log.getScreenName(),
                log.getOperation(),
                log.getContent(),
                log.getPreviousContent(),
                log.getPerformedBy(),
                log.getPerformedAt(),
                log.getStatus(),
                log.getRemarks());
    }
}
