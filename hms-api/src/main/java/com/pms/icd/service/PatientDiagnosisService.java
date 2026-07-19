package com.pms.icd.service;

import com.pms.activitylog.service.ActivityLogEntry;
import com.pms.activitylog.service.ActivityLogService;
import com.pms.common.EntityNotFoundException;
import com.pms.icd.dto.PatientDiagnosisDto;
import com.pms.icd.entity.IcdCode;
import com.pms.icd.entity.PatientDiagnosis;
import com.pms.icd.repository.IcdCodeRepository;
import com.pms.icd.repository.PatientDiagnosisRepository;
import com.pms.masters.entity.Consultant;
import com.pms.masters.entity.Department;
import com.pms.masters.repository.ConsultantRepository;
import com.pms.masters.repository.DepartmentRepository;
import com.pms.registration.entity.Patient;
import com.pms.registration.repository.PatientRepository;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Create/update/delete for a patient's assigned ICD diagnoses. Every
 * operation is written through the shared ActivityLogService (module "ICD
 * Diagnosis") rather than a bespoke diff-audit table - reuses the same
 * content/previousContent snapshot convention already built for the IP/OP
 * Billing Activity Log, so "Previous Value vs Current Value" is satisfied
 * without duplicating audit infrastructure.
 */
@Service
@Transactional(readOnly = true)
public class PatientDiagnosisService {

    private final PatientDiagnosisRepository repository;
    private final PatientRepository patientRepository;
    private final IcdCodeRepository icdCodeRepository;
    private final DepartmentRepository departmentRepository;
    private final ConsultantRepository consultantRepository;
    private final ActivityLogService activityLogService;

    public PatientDiagnosisService(
            PatientDiagnosisRepository repository,
            PatientRepository patientRepository,
            IcdCodeRepository icdCodeRepository,
            DepartmentRepository departmentRepository,
            ConsultantRepository consultantRepository,
            ActivityLogService activityLogService) {
        this.repository = repository;
        this.patientRepository = patientRepository;
        this.icdCodeRepository = icdCodeRepository;
        this.departmentRepository = departmentRepository;
        this.consultantRepository = consultantRepository;
        this.activityLogService = activityLogService;
    }

    public List<PatientDiagnosisDto> findByPatient(Long patientId) {
        return repository.findByPatientIdAndActiveTrueOrderByDiagnosisDateDesc(patientId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public PatientDiagnosisDto create(Long patientId, PatientDiagnosisDto dto) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found: " + patientId));
        IcdCode icdCode = icdCodeRepository.findById(dto.icdCodeId())
                .orElseThrow(() -> new EntityNotFoundException("ICD code not found: " + dto.icdCodeId()));

        PatientDiagnosis diagnosis = new PatientDiagnosis();
        diagnosis.setPatient(patient);
        applyFields(diagnosis, dto, icdCode);
        diagnosis.setActive(true);
        diagnosis.setAddedBy(currentUsername());

        PatientDiagnosis saved = repository.save(diagnosis);
        activityLogService.log(new ActivityLogEntry("ICD Diagnosis", "Create")
                .content(diagnosisSummary(saved))
                .status("Success")
                .patient(patient.getRegistrationNumber(), patientDisplayName(patient))
                .screenName("Patient ICD Code Details"));
        return toDto(saved);
    }

    @Transactional
    public PatientDiagnosisDto update(Long id, PatientDiagnosisDto dto) {
        PatientDiagnosis diagnosis = getOrThrow(id);
        String previousContent = diagnosisSummary(diagnosis);
        IcdCode icdCode = icdCodeRepository.findById(dto.icdCodeId())
                .orElseThrow(() -> new EntityNotFoundException("ICD code not found: " + dto.icdCodeId()));
        applyFields(diagnosis, dto, icdCode);

        PatientDiagnosis saved = repository.save(diagnosis);
        Patient patient = saved.getPatient();
        activityLogService.log(new ActivityLogEntry("ICD Diagnosis", "Update")
                .content(diagnosisSummary(saved))
                .previousContent(previousContent)
                .status("Updated")
                .patient(patient.getRegistrationNumber(), patientDisplayName(patient))
                .screenName("Patient ICD Code Details"));
        return toDto(saved);
    }

    @Transactional
    public void delete(Long id) {
        PatientDiagnosis diagnosis = getOrThrow(id);
        String content = diagnosisSummary(diagnosis);
        Patient patient = diagnosis.getPatient();
        diagnosis.setActive(false);
        repository.save(diagnosis);
        activityLogService.log(new ActivityLogEntry("ICD Diagnosis", "Delete")
                .content(content)
                .status("Deleted")
                .patient(patient.getRegistrationNumber(), patientDisplayName(patient))
                .screenName("Patient ICD Code Details"));
    }

    private void applyFields(PatientDiagnosis diagnosis, PatientDiagnosisDto dto, IcdCode icdCode) {
        diagnosis.setIcdCode(icdCode);
        diagnosis.setDiagnosisType(dto.diagnosisType());
        diagnosis.setDepartment(resolveDepartment(dto.departmentId()));
        diagnosis.setConsultant(resolveConsultant(dto.consultantId()));
        diagnosis.setDiagnosisDate(dto.diagnosisDate());
        diagnosis.setStatus(dto.status());
        diagnosis.setSeverity(dto.severity());
        diagnosis.setComments(dto.comments());
        diagnosis.setClinicalNotes(dto.clinicalNotes());
    }

    private Department resolveDepartment(Long departmentId) {
        if (departmentId == null) {
            return null;
        }
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new EntityNotFoundException("Department not found: " + departmentId));
    }

    private Consultant resolveConsultant(Long consultantId) {
        if (consultantId == null) {
            return null;
        }
        return consultantRepository.findById(consultantId)
                .orElseThrow(() -> new EntityNotFoundException("Consultant not found: " + consultantId));
    }

    private String diagnosisSummary(PatientDiagnosis d) {
        return d.getIcdCode().getCode() + " - " + d.getIcdCode().getDiseaseName()
                + " (" + d.getDiagnosisType() + ", " + d.getStatus()
                + (d.getSeverity() != null ? ", Severity: " + d.getSeverity() : "") + ")";
    }

    private String patientDisplayName(Patient patient) {
        return (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim();
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private PatientDiagnosis getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Diagnosis not found: " + id));
    }

    private PatientDiagnosisDto toDto(PatientDiagnosis d) {
        Patient patient = d.getPatient();
        IcdCode icdCode = d.getIcdCode();
        Department department = d.getDepartment();
        Consultant consultant = d.getConsultant();
        return new PatientDiagnosisDto(
                d.getId(),
                patient.getId(),
                patient.getRegistrationNumber(),
                patientDisplayName(patient),
                icdCode.getId(),
                icdCode.getCode(),
                icdCode.getDiseaseName(),
                icdCode.getVersion().name(),
                d.getDiagnosisType(),
                department != null ? department.getId() : null,
                department != null ? department.getName() : null,
                consultant != null ? consultant.getId() : null,
                consultant != null ? consultant.getName() : null,
                d.getDiagnosisDate(),
                d.getStatus(),
                d.getSeverity(),
                d.getComments(),
                d.getClinicalNotes(),
                d.getAddedBy(),
                d.getCreatedAt(),
                d.getUpdatedAt());
    }
}
