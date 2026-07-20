package com.pms.lab.service;

import com.pms.activitylog.service.ActivityLogEntry;
import com.pms.activitylog.service.ActivityLogService;
import com.pms.common.EntityNotFoundException;
import com.pms.lab.dto.LabApprovedListRowDto;
import com.pms.lab.dto.LabTestEntryDto;
import com.pms.lab.dto.LabTestEntryListRowDto;
import com.pms.lab.dto.LabTestEntrySaveDto;
import com.pms.lab.dto.LabTestResultDto;
import com.pms.lab.dto.LabTestResultInputDto;
import com.pms.lab.entity.LabComponent;
import com.pms.lab.entity.LabRequisition;
import com.pms.lab.entity.LabRequisitionItem;
import com.pms.lab.entity.LabSubCategory;
import com.pms.lab.entity.LabTestEntry;
import com.pms.lab.entity.LabTestEntryStatus;
import com.pms.lab.entity.LabTestResult;
import com.pms.lab.repository.LabComponentRepository;
import com.pms.lab.repository.LabTestEntryRepository;
import com.pms.masters.entity.Consultant;
import com.pms.registration.entity.Patient;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The lab technician's result-entry workflow: New -> Draft (repeatable
 * saves) -> Approved (locked). One LabTestEntry per billed LabRequisition,
 * auto-created by createFromRequisition() when LabRequisitionService.approve()
 * records payment - see that call site.
 */
@Service
@Transactional(readOnly = true)
public class LabTestEntryService {

    private final LabTestEntryRepository repository;
    private final LabComponentRepository componentRepository;
    private final ActivityLogService activityLogService;

    public LabTestEntryService(
            LabTestEntryRepository repository, LabComponentRepository componentRepository, ActivityLogService activityLogService) {
        this.repository = repository;
        this.componentRepository = componentRepository;
        this.activityLogService = activityLogService;
    }

    /**
     * Only requisition items that reference a real Lab Sub-Category produce
     * result rows here - ad-hoc/Investigations items (see
     * LabRequisitionService.create()) have no LabComponent to record a
     * result against, so a requisition made up entirely of those (a pure
     * "Billing" requisitionType) skips lab-entry creation altogether rather
     * than leaving an empty, nothing-to-do row in the technician's queue.
     */
    @Transactional
    public void createFromRequisition(LabRequisition requisition) {
        List<Long> subCategoryIds = requisition.getItems().stream()
                .map(LabRequisitionItem::getSubCategory)
                .filter(java.util.Objects::nonNull)
                .map(LabSubCategory::getId)
                .toList();
        if (subCategoryIds.isEmpty()) {
            return;
        }
        List<LabComponent> components = componentRepository.findBySubCategoryIdInOrderByOrderingNoAsc(subCategoryIds);

        LabTestEntry entry = new LabTestEntry();
        entry.setRequisition(requisition);
        entry.setStatus(LabTestEntryStatus.NEW);
        entry.setReportedDate(LocalDateTime.now());
        for (LabComponent component : components) {
            LabTestResult result = new LabTestResult();
            result.setLabTestEntry(entry);
            result.setComponent(component);
            entry.getResults().add(result);
        }
        repository.save(entry);
    }

    public List<LabTestEntryListRowDto> getQueue(List<LabTestEntryStatus> statuses) {
        return repository.findByStatusInOrderByCreatedAtDesc(statuses).stream().map(this::toListRow).toList();
    }

    public List<LabApprovedListRowDto> getApprovedList() {
        return repository.findByStatusOrderByApprovedAtDesc(LabTestEntryStatus.APPROVED).stream()
                .map(this::toApprovedRow)
                .toList();
    }

    public LabTestEntryDto getById(Long id) {
        return toDto(getOrThrow(id));
    }

    @Transactional
    public LabTestEntryDto save(Long id, LabTestEntrySaveDto dto) {
        return applySave(id, dto, null);
    }

    @Transactional
    public LabTestEntryDto saveDraft(Long id, LabTestEntrySaveDto dto) {
        return applySave(id, dto, LabTestEntryStatus.DRAFT);
    }

    @Transactional
    public LabTestEntryDto approve(Long id, LabTestEntrySaveDto dto) {
        LabTestEntry entry = applyFieldsAndResults(getOrThrow(id), dto, LabTestEntryStatus.APPROVED);
        entry.setApprovedAt(LocalDateTime.now());
        entry.setApprovedBy(currentUsername());
        LabTestEntry saved = repository.save(entry);
        Patient patient = saved.getRequisition().getPatient();
        activityLogService.log(new ActivityLogEntry("Laboratory", "Approve")
                .content("Lab report approved for requisition " + saved.getRequisition().getRequisitionNumber())
                .status("Approved")
                .patient(patient.getRegistrationNumber(), patientDisplayName(patient))
                .screenName("Lab Test Entry"));
        return toDto(saved);
    }

    private LabTestEntryDto applySave(Long id, LabTestEntrySaveDto dto, LabTestEntryStatus newStatus) {
        LabTestEntry entry = applyFieldsAndResults(getOrThrow(id), dto, newStatus);
        return toDto(repository.save(entry));
    }

    private LabTestEntry applyFieldsAndResults(LabTestEntry entry, LabTestEntrySaveDto dto, LabTestEntryStatus newStatus) {
        if (entry.getStatus() == LabTestEntryStatus.APPROVED) {
            throw new IllegalArgumentException("This lab report has already been approved and can no longer be edited");
        }
        entry.setSpecimenTypes(dto.specimenTypes() != null ? String.join(",", dto.specimenTypes()) : null);
        entry.setReportedDate(dto.reportedDate());
        entry.setRemarks(dto.remarks());
        entry.setUpdatedBy(currentUsername());

        Map<Long, LabTestResult> byComponentId = entry.getResults().stream()
                .collect(Collectors.toMap(r -> r.getComponent().getId(), r -> r));
        for (LabTestResultInputDto input : dto.results()) {
            LabTestResult result = byComponentId.get(input.componentId());
            if (result != null) {
                result.setResultValue(input.resultValue());
                result.setAbnormal(input.abnormal());
            }
        }

        if (newStatus != null) {
            entry.setStatus(newStatus);
        }
        return entry;
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private String patientDisplayName(Patient patient) {
        return (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim();
    }

    private LabTestEntry getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Lab test entry not found: " + id));
    }

    private LabTestEntryListRowDto toListRow(LabTestEntry entry) {
        Patient patient = entry.getRequisition().getPatient();
        return new LabTestEntryListRowDto(
                entry.getId(),
                patient.getRegistrationNumber(),
                patientDisplayName(patient),
                patient.getGender(),
                entry.getStatus().name(),
                patient.getMobileNumber(),
                entry.getRequisition().getCreatedBy(),
                entry.getCreatedAt() != null ? LocalDateTime.ofInstant(entry.getCreatedAt(), java.time.ZoneId.systemDefault()) : null);
    }

    private LabApprovedListRowDto toApprovedRow(LabTestEntry entry) {
        LabRequisition requisition = entry.getRequisition();
        Patient patient = requisition.getPatient();
        Consultant consultant = requisition.getConsultant();
        return new LabApprovedListRowDto(
                entry.getId(),
                patient.getRegistrationNumber(),
                patientDisplayName(patient),
                patient.getMobileNumber(),
                consultant != null ? consultant.getName() : null,
                requisition.getPatientType(),
                patient.getGender(),
                entry.getUpdatedBy(),
                entry.getCreatedAt() != null ? LocalDateTime.ofInstant(entry.getCreatedAt(), java.time.ZoneId.systemDefault()) : null);
    }

    private LabTestEntryDto toDto(LabTestEntry entry) {
        LabRequisition requisition = entry.getRequisition();
        Patient patient = requisition.getPatient();
        Consultant consultant = requisition.getConsultant();
        List<LabTestResultDto> results = entry.getResults().stream().map(this::toResultDto).toList();
        List<String> specimenTypes = entry.getSpecimenTypes() != null
                ? Arrays.asList(entry.getSpecimenTypes().split(","))
                : new ArrayList<>();
        return new LabTestEntryDto(
                entry.getId(),
                patient.getRegistrationNumber(),
                patientDisplayName(patient),
                patient.getAge(),
                patient.getGender(),
                patient.getMobileNumber(),
                consultant != null ? consultant.getName() : null,
                entry.getStatus().name(),
                String.join(",", specimenTypes),
                entry.getReportedDate(),
                entry.getRemarks(),
                requisition.getCreatedBy(),
                entry.getUpdatedBy(),
                results);
    }

    private LabTestResultDto toResultDto(LabTestResult result) {
        LabComponent component = result.getComponent();
        return new LabTestResultDto(
                component.getId(),
                component.getSubCategory().getName(),
                component.getName(),
                component.getSampleType(),
                component.getMethod(),
                component.getNormalRange(),
                component.getUnits(),
                component.getMaleRangeFrom(),
                component.getMaleRangeTo(),
                component.getFemaleRangeFrom(),
                component.getFemaleRangeTo(),
                result.getResultValue(),
                result.isAbnormal());
    }
}
