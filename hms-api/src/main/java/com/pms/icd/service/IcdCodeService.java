package com.pms.icd.service;

import com.pms.common.EntityNotFoundException;
import com.pms.icd.dto.IcdCodeDto;
import com.pms.icd.dto.IcdCodeImportResultDto;
import com.pms.icd.entity.IcdCode;
import com.pms.icd.entity.IcdCodeAuditLog;
import com.pms.icd.entity.IcdVersion;
import com.pms.icd.repository.IcdCodeAuditLogRepository;
import com.pms.icd.repository.IcdCodeRepository;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * ICD Code Master CRUD, mirroring ConsultantService's create/update/
 * deactivate/restore + audit-log shape. Also hosts the autocomplete search
 * used by the Assign ICD Diagnosis form and a real (CSV, not XLSX-binary)
 * bulk import - no Apache POI/Excel-parsing dependency exists anywhere in
 * this codebase yet, so a CSV upload (which Excel opens/saves natively) is
 * the bulk-load mechanism instead of adding a new library for one screen.
 */
@Service
@Transactional(readOnly = true)
public class IcdCodeService {

    private static final String CREATE = "CREATE";
    private static final String UPDATE = "UPDATE";
    private static final String DEACTIVATE = "DEACTIVATE";
    private static final String RESTORE = "RESTORE";

    private final IcdCodeRepository repository;
    private final IcdCodeAuditLogRepository auditLogRepository;

    public IcdCodeService(IcdCodeRepository repository, IcdCodeAuditLogRepository auditLogRepository) {
        this.repository = repository;
        this.auditLogRepository = auditLogRepository;
    }

    public List<IcdCodeDto> findActive() {
        return toDtos(repository.findByActiveTrueOrderByCodeAsc());
    }

    public List<IcdCodeDto> findInactive() {
        return toDtos(repository.findByActiveFalseOrderByUpdatedAtDesc());
    }

    public IcdCodeDto findById(Long id) {
        return toDto(getOrThrow(id), latestByCode(CREATE), latestByCode(UPDATE));
    }

    public List<IcdCodeDto> search(String query, IcdVersion version) {
        String trimmed = query == null ? "" : query.trim();
        if (trimmed.isEmpty()) {
            return List.of();
        }
        return repository.search(trimmed, version).stream().limit(20).map(code -> toDto(code, Map.of(), Map.of())).toList();
    }

    @Transactional
    public IcdCodeDto create(IcdCodeDto dto) {
        if (repository.existsByVersionAndCodeIgnoreCase(dto.version(), dto.code())) {
            throw new IllegalArgumentException("ICD code " + dto.code() + " already exists for " + dto.version());
        }
        IcdCode code = new IcdCode();
        applyFields(code, dto);
        code.setActive(true);
        IcdCode saved = repository.save(code);
        recordAudit(saved, CREATE);
        return findById(saved.getId());
    }

    @Transactional
    public IcdCodeDto update(Long id, IcdCodeDto dto) {
        IcdCode code = getOrThrow(id);
        if (!code.getCode().equalsIgnoreCase(dto.code()) || code.getVersion() != dto.version()) {
            if (repository.existsByVersionAndCodeIgnoreCase(dto.version(), dto.code())) {
                throw new IllegalArgumentException("ICD code " + dto.code() + " already exists for " + dto.version());
            }
        }
        applyFields(code, dto);
        IcdCode saved = repository.save(code);
        recordAudit(saved, UPDATE);
        return findById(saved.getId());
    }

    @Transactional
    public void deactivate(Long id) {
        IcdCode code = getOrThrow(id);
        code.setActive(false);
        repository.save(code);
        recordAudit(code, DEACTIVATE);
    }

    @Transactional
    public void restore(Long id) {
        IcdCode code = getOrThrow(id);
        code.setActive(true);
        repository.save(code);
        recordAudit(code, RESTORE);
    }

    /**
     * Parses a CSV upload (header row: version,code,diseaseName,chapter,
     * category,whoVersion,shortDescription) and inserts new active codes,
     * skipping rows that duplicate an existing version+code pair or fail to
     * parse rather than aborting the whole batch.
     */
    @Transactional
    public IcdCodeImportResultDto importCsv(MultipartFile file) {
        int imported = 0;
        int skipped = 0;
        List<String> errors = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line = reader.readLine(); // header
            int rowNumber = 1;
            while ((line = reader.readLine()) != null) {
                rowNumber++;
                if (line.isBlank()) {
                    continue;
                }
                String[] cols = line.split(",", -1);
                if (cols.length < 3) {
                    skipped++;
                    errors.add("Row " + rowNumber + ": expected at least version, code, diseaseName");
                    continue;
                }
                try {
                    IcdVersion version = IcdVersion.valueOf(cols[0].trim().toUpperCase().replace("-", "_"));
                    String codeValue = cols[1].trim();
                    String diseaseName = cols[2].trim();
                    if (codeValue.isEmpty() || diseaseName.isEmpty()) {
                        skipped++;
                        errors.add("Row " + rowNumber + ": code/diseaseName is blank");
                        continue;
                    }
                    if (repository.existsByVersionAndCodeIgnoreCase(version, codeValue)) {
                        skipped++;
                        errors.add("Row " + rowNumber + ": " + codeValue + " already exists for " + version);
                        continue;
                    }
                    IcdCode code = new IcdCode();
                    code.setVersion(version);
                    code.setCode(codeValue);
                    code.setDiseaseName(diseaseName);
                    code.setChapter(cols.length > 3 ? blankToNull(cols[3]) : null);
                    code.setCategory(cols.length > 4 ? blankToNull(cols[4]) : null);
                    code.setWhoVersion(cols.length > 5 ? blankToNull(cols[5]) : null);
                    code.setShortDescription(cols.length > 6 ? blankToNull(cols[6]) : null);
                    code.setActive(true);
                    IcdCode saved = repository.save(code);
                    recordAudit(saved, CREATE);
                    imported++;
                } catch (IllegalArgumentException e) {
                    skipped++;
                    errors.add("Row " + rowNumber + ": " + e.getMessage());
                }
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to read the uploaded CSV file: " + e.getMessage());
        }
        return new IcdCodeImportResultDto(imported, skipped, errors);
    }

    private String blankToNull(String value) {
        String trimmed = value == null ? "" : value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void applyFields(IcdCode code, IcdCodeDto dto) {
        code.setVersion(dto.version());
        code.setCode(dto.code().trim());
        code.setDiseaseName(dto.diseaseName().trim());
        code.setChapter(dto.chapter());
        code.setCategory(dto.category());
        code.setWhoVersion(dto.whoVersion());
        code.setShortDescription(dto.shortDescription());
    }

    private void recordAudit(IcdCode code, String operation) {
        auditLogRepository.save(new IcdCodeAuditLog(code.getId(), code.getCode(), operation, currentUsername()));
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private List<IcdCodeDto> toDtos(List<IcdCode> codes) {
        Map<Long, IcdCodeAuditLog> createdBy = latestByCode(CREATE);
        Map<Long, IcdCodeAuditLog> updatedBy = latestByCode(UPDATE);
        return codes.stream().map(code -> toDto(code, createdBy, updatedBy)).toList();
    }

    private Map<Long, IcdCodeAuditLog> latestByCode(String operation) {
        return auditLogRepository.findAllByOperationOrderByPerformedAtDesc(operation).stream()
                .collect(HashMap::new, (map, log) -> map.putIfAbsent(log.getIcdCodeId(), log), HashMap::putAll);
    }

    private IcdCode getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("ICD code not found: " + id));
    }

    private IcdCodeDto toDto(IcdCode code, Map<Long, IcdCodeAuditLog> createdBy, Map<Long, IcdCodeAuditLog> updatedBy) {
        IcdCodeAuditLog created = createdBy.get(code.getId());
        IcdCodeAuditLog updated = updatedBy.get(code.getId());
        return new IcdCodeDto(
                code.getId(),
                code.getVersion(),
                code.getCode(),
                code.getDiseaseName(),
                code.getChapter(),
                code.getCategory(),
                code.getWhoVersion(),
                code.getShortDescription(),
                code.isActive(),
                code.getCreatedAt(),
                created != null ? created.getPerformedBy() : null,
                code.getUpdatedAt(),
                updated != null ? updated.getPerformedBy() : null);
    }
}
