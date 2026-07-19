package com.pms.dischargesummary.service;

import com.pms.activitylog.service.ActivityLogEntry;
import com.pms.activitylog.service.ActivityLogService;
import com.pms.common.EntityNotFoundException;
import com.pms.dischargesummary.dto.DischargeAdviseDrugDto;
import com.pms.dischargesummary.dto.DischargeInitiatedRowDto;
import com.pms.dischargesummary.dto.DischargeSummaryDto;
import com.pms.dischargesummary.dto.DischargeSummaryListRowDto;
import com.pms.dischargesummary.dto.DischargeSurgeryProcedureDto;
import com.pms.dischargesummary.entity.DischargeAdviseDrug;
import com.pms.dischargesummary.entity.DischargeSummary;
import com.pms.dischargesummary.entity.DischargeSurgeryProcedure;
import com.pms.dischargesummary.repository.DischargeSummaryRepository;
import com.pms.ipadmission.entity.Admission;
import com.pms.ipadmission.entity.Room;
import com.pms.ipadmission.repository.AdmissionRepository;
import com.pms.registration.entity.Patient;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * IP Discharge Summary clinical document: one per DISCHARGED admission,
 * created lazily the first time it's saved (findByAdmission returns an
 * empty-shell DTO pre-filled from the Admission/Patient for the Edit form,
 * rather than 404ing, since "no summary yet" is the normal starting state).
 */
@Service
@Transactional(readOnly = true)
public class DischargeSummaryService {

    private final DischargeSummaryRepository repository;
    private final AdmissionRepository admissionRepository;
    private final ActivityLogService activityLogService;

    public DischargeSummaryService(
            DischargeSummaryRepository repository, AdmissionRepository admissionRepository, ActivityLogService activityLogService) {
        this.repository = repository;
        this.admissionRepository = admissionRepository;
        this.activityLogService = activityLogService;
    }

    public List<DischargeSummaryListRowDto> getList(LocalDate fromDate, LocalDate toDate, String billingTypeFilter) {
        var fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        var toDateTime = toDate != null ? toDate.plusDays(1).atStartOfDay() : null;
        return admissionRepository.findDischargedForList(fromDateTime, toDateTime).stream()
                .filter(admission -> matchesPaymentTypeFilter(admission, billingTypeFilter))
                .map(this::toListRow)
                .toList();
    }

    /** Discharge Initiated List: admissions in DISCHARGE_INITIATED status (stage 1 of discharge, not yet finalized). */
    public List<DischargeInitiatedRowDto> getInitiatedList(LocalDate fromDate, LocalDate toDate) {
        var fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        var toDateTime = toDate != null ? toDate.plusDays(1).atStartOfDay() : null;
        return admissionRepository.findDischargeInitiatedForList(fromDateTime, toDateTime).stream()
                .map(this::toInitiatedRow)
                .toList();
    }

    private DischargeInitiatedRowDto toInitiatedRow(Admission admission) {
        Patient patient = admission.getPatient();
        Room room = admission.getRoom();
        String wardLocation = room != null ? room.getRoomNumber() + " - " + room.getRoomType().getName() : null;
        String diagnosis = repository.findByAdmissionId(admission.getId())
                .map(DischargeSummary::getDiagnosisText)
                .filter(text -> text != null && !text.isBlank())
                .map(text -> String.join(", ", splitLines(text)))
                .orElse(admission.getDescriptionOfCase());
        return new DischargeInitiatedRowDto(
                admission.getId(),
                admission.getAdmissionNumber(),
                patient.getRegistrationNumber(),
                patientDisplayName(patient),
                patient.getGender(),
                patient.getAge(),
                patient.getMobileNumber(),
                patient.getAddress(),
                admission.getAdmissionDate(),
                admission.getPaymentType() != null ? admission.getPaymentType().name() : null,
                wardLocation,
                diagnosis,
                admission.getPrimaryConsultant());
    }

    private DischargeSummaryListRowDto toListRow(Admission admission) {
        Patient patient = admission.getPatient();
        Optional<DischargeSummary> summary = repository.findByAdmissionId(admission.getId());
        String surgery = summary
                .flatMap(s -> s.getSurgeryProcedures().stream().findFirst())
                .map(DischargeSurgeryProcedure::getProcedureName)
                .filter(name -> name != null && !name.isBlank())
                .map(name -> "Surgery")
                .orElse(null);
        return new DischargeSummaryListRowDto(
                admission.getId(),
                admission.getAdmissionNumber(),
                patient.getRegistrationNumber(),
                patientDisplayName(patient),
                patient.getGender(),
                admission.getInsuranceType(),
                admission.getAdmissionDate(),
                admission.getDischargeDate(),
                surgery,
                summary.map(DischargeSummary::getId).orElse(null));
    }

    public DischargeSummaryDto getByAdmissionId(Long admissionId) {
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new EntityNotFoundException("Admission not found: " + admissionId));
        return repository.findByAdmissionId(admissionId)
                .map(summary -> toDto(summary, admission))
                .orElseGet(() -> emptyDto(admission));
    }

    @Transactional
    public DischargeSummaryDto save(Long admissionId, DischargeSummaryDto dto) {
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new EntityNotFoundException("Admission not found: " + admissionId));
        boolean isCreate = repository.findByAdmissionId(admissionId).isEmpty();
        DischargeSummary summary = repository.findByAdmissionId(admissionId).orElseGet(DischargeSummary::new);
        summary.setAdmission(admission);
        applyFields(summary, dto);

        summary.getSurgeryProcedures().clear();
        List<DischargeSurgeryProcedureDto> procedures = dto.surgeryProcedures() != null ? dto.surgeryProcedures() : List.of();
        for (int i = 0; i < procedures.size(); i++) {
            DischargeSurgeryProcedureDto p = procedures.get(i);
            DischargeSurgeryProcedure entity = new DischargeSurgeryProcedure();
            entity.setDischargeSummary(summary);
            entity.setProcedureName(p.procedureName());
            entity.setSurgeonName(p.surgeonName());
            entity.setAssistantSurgeonName(p.assistantSurgeonName());
            entity.setAnaesthetistName(p.anaesthetistName());
            entity.setDateOfSurgery(p.dateOfSurgery());
            entity.setSortOrder(i);
            summary.getSurgeryProcedures().add(entity);
        }

        summary.getAdviseDrugs().clear();
        List<DischargeAdviseDrugDto> drugs = dto.adviseDrugs() != null ? dto.adviseDrugs() : List.of();
        for (int i = 0; i < drugs.size(); i++) {
            DischargeAdviseDrugDto d = drugs.get(i);
            DischargeAdviseDrug entity = new DischargeAdviseDrug();
            entity.setDischargeSummary(summary);
            entity.setDrugName(d.drugName());
            entity.setAdviseType(d.adviseType());
            entity.setDose(d.dose());
            entity.setMorning(d.morning());
            entity.setAfternoon(d.afternoon());
            entity.setEvening(d.evening());
            entity.setNight(d.night());
            entity.setRoute(d.route());
            entity.setRelationshipWithMeal(d.relationshipWithMeal());
            entity.setDuration(d.duration());
            entity.setSortOrder(i);
            summary.getAdviseDrugs().add(entity);
        }

        DischargeSummary saved = repository.save(summary);
        activityLogService.log(new ActivityLogEntry("Discharge", isCreate ? "Create" : "Update")
                .content("Discharge summary " + (isCreate ? "created" : "updated") + " for " + admission.getAdmissionNumber())
                .status(isCreate ? "Success" : "Updated")
                .patient(admission.getPatient().getRegistrationNumber(), patientDisplayName(admission.getPatient()))
                .ipNumber(admission.getAdmissionNumber())
                .screenName("Discharge Summary"));
        return toDto(saved, admission);
    }

    private boolean matchesPaymentTypeFilter(Admission admission, String filter) {
        if (filter == null || filter.equalsIgnoreCase("ALL")) {
            return true;
        }
        if (filter.equalsIgnoreCase("CASH")) {
            return admission.getPaymentType() != null && admission.getPaymentType().name().equalsIgnoreCase("CASH");
        }
        if (filter.equalsIgnoreCase("CLAIM")) {
            return admission.getPaymentType() != null && !admission.getPaymentType().name().equalsIgnoreCase("CASH");
        }
        return true;
    }

    private void applyFields(DischargeSummary s, DischargeSummaryDto dto) {
        s.setConsultantsText(joinLines(dto.consultants()));
        s.setReferredBy(dto.referredBy());
        s.setWeightKg(dto.weightKg());
        s.setRcnNo(dto.rcnNo());
        s.setTitle(dto.title());
        s.setBloodGroup(dto.bloodGroup());
        s.setDiagnosisText(joinLines(dto.diagnosis()));
        s.setProceduresText(joinLines(dto.procedures()));

        s.setBriefHistory(dto.briefHistory());
        s.setPastHistory(dto.pastHistory());
        s.setPersonalHistory(dto.personalHistory());
        s.setSurgicalHistory(dto.surgicalHistory());
        s.setFamilyHistory(dto.familyHistory());
        s.setIntolerance(dto.intolerance());
        s.setImmunization(dto.immunization());
        s.setMenstrualHistory(dto.menstrualHistory());
        s.setMaritalHistory(dto.maritalHistory());
        s.setObstetricHistory(dto.obstetricHistory());

        s.setGeneralExamination(dto.generalExamination());
        s.setTempF(dto.tempF());
        s.setPr(dto.pr());
        s.setBp(dto.bp());
        s.setRr(dto.rr());
        s.setSpo2(dto.spo2());
        s.setCbg(dto.cbg());
        s.setCvs(dto.cvs());
        s.setRs(dto.rs());
        s.setAbdomen(dto.abdomen());
        s.setCns(dto.cns());
        s.setLocalExamination(dto.localExamination());

        s.setInvestigationXray(dto.investigationXray());
        s.setInvestigationEcg(dto.investigationEcg());
        s.setInvestigationEcho(dto.investigationEcho());
        s.setInvestigationTmt(dto.investigationTmt());
        s.setInvestigationUsgAbdomen(dto.investigationUsgAbdomen());
        s.setInvestigationUsgPelvis(dto.investigationUsgPelvis());
        s.setInvestigationEndoscopy(dto.investigationEndoscopy());
        s.setInvestigationColonoscopy(dto.investigationColonoscopy());
        s.setInvestigationSigmoidoscopy(dto.investigationSigmoidoscopy());
        s.setInvestigationMriScan(dto.investigationMriScan());
        s.setInvestigationDopplerStudy(dto.investigationDopplerStudy());
        s.setInvestigationNerveConduction(dto.investigationNerveConduction());

        s.setBloodInvestigationDate(dto.bloodInvestigationDate());
        s.setHemoglobin(dto.hemoglobin());
        s.setBloodUrea(dto.bloodUrea());
        s.setSrCreatinine(dto.srCreatinine());
        s.setSodium(dto.sodium());
        s.setPotassium(dto.potassium());
        s.setHba1c(dto.hba1c());
        s.setOrEnclosed(dto.orEnclosed());

        s.setAngiogramDate(dto.angiogramDate());
        s.setAngiogramSite(dto.angiogramSite());
        s.setAngiogramArtery(dto.angiogramArtery());
        s.setAngiogramProcedure(dto.angiogramProcedure());
        s.setLmca(dto.lmca());
        s.setLad(dto.lad());
        s.setLcx(dto.lcx());
        s.setRca(dto.rca());
        s.setImpressionText(joinLines(dto.impression()));
        s.setRecommendation(dto.recommendation());
        s.setTreatmentGiven(dto.treatmentGiven());
        s.setCourseInHospital(dto.courseInHospital());

        s.setReview(dto.review());
        s.setDietAdvice(dto.dietAdvice());
        s.setPhysiotherapy(dto.physiotherapy());
        s.setPhysicalActivity(dto.physicalActivity());
        s.setAdvice(dto.advice());
        s.setReviewDescription(dto.reviewDescription());
        s.setConditionAtDischarge(dto.conditionAtDischarge());
        s.setEmergencyContactNumbers(dto.emergencyContactNumbers());
        s.setEmergencySymptomsText(joinLines(dto.emergencySymptoms()));
        s.setCheckedBy(dto.checkedBy());
        s.setConsultantSignOff(dto.consultantSignOff());
    }

    private String joinLines(List<String> lines) {
        if (lines == null) {
            return null;
        }
        List<String> cleaned = lines.stream().filter(v -> v != null && !v.isBlank()).toList();
        return cleaned.isEmpty() ? null : String.join("\n", cleaned);
    }

    private List<String> splitLines(String text) {
        if (text == null || text.isBlank()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(List.of(text.split("\n")));
    }

    private String patientDisplayName(Patient patient) {
        return (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim();
    }

    /** An unsaved, all-blank DischargeSummary run through the same toDto() mapping used for a real one, so the Edit form always loads a consistently-shaped DTO whether or not a summary exists yet. */
    private DischargeSummaryDto emptyDto(Admission admission) {
        return toDto(new DischargeSummary(), admission);
    }

    private DischargeSummaryDto toDto(DischargeSummary s, Admission admission) {
        Patient patient = admission.getPatient();
        Room room = admission.getRoom();
        return new DischargeSummaryDto(
                s.getId(),
                admission.getId(),
                patient.getRegistrationNumber(),
                patientDisplayName(patient),
                patient.getGender(),
                patient.getAge(),
                patient.getMobileNumber(),
                patient.getAddress(),
                admission.getAdmissionNumber(),
                room != null ? room.getRoomNumber() : null,
                admission.getAdmissionDate(),
                admission.getDischargeDate(),
                admission.getMaritalStatus(),
                admission.getOccupation(),
                admission.getPrimaryConsultant(),
                splitLines(s.getConsultantsText()),
                s.getReferredBy(),
                s.getWeightKg(),
                s.getRcnNo(),
                s.getTitle(),
                s.getBloodGroup(),
                splitLines(s.getDiagnosisText()),
                splitLines(s.getProceduresText()),
                s.getBriefHistory(),
                s.getPastHistory(),
                s.getPersonalHistory(),
                s.getSurgicalHistory(),
                s.getFamilyHistory(),
                s.getIntolerance(),
                s.getImmunization(),
                s.getMenstrualHistory(),
                s.getMaritalHistory(),
                s.getObstetricHistory(),
                s.getGeneralExamination(),
                s.getTempF(),
                s.getPr(),
                s.getBp(),
                s.getRr(),
                s.getSpo2(),
                s.getCbg(),
                s.getCvs(),
                s.getRs(),
                s.getAbdomen(),
                s.getCns(),
                s.getLocalExamination(),
                s.getInvestigationXray(),
                s.getInvestigationEcg(),
                s.getInvestigationEcho(),
                s.getInvestigationTmt(),
                s.getInvestigationUsgAbdomen(),
                s.getInvestigationUsgPelvis(),
                s.getInvestigationEndoscopy(),
                s.getInvestigationColonoscopy(),
                s.getInvestigationSigmoidoscopy(),
                s.getInvestigationMriScan(),
                s.getInvestigationDopplerStudy(),
                s.getInvestigationNerveConduction(),
                s.getBloodInvestigationDate(),
                s.getHemoglobin(),
                s.getBloodUrea(),
                s.getSrCreatinine(),
                s.getSodium(),
                s.getPotassium(),
                s.getHba1c(),
                s.getOrEnclosed(),
                s.getAngiogramDate(),
                s.getAngiogramSite(),
                s.getAngiogramArtery(),
                s.getAngiogramProcedure(),
                s.getLmca(),
                s.getLad(),
                s.getLcx(),
                s.getRca(),
                splitLines(s.getImpressionText()),
                s.getRecommendation(),
                s.getTreatmentGiven(),
                s.getSurgeryProcedures().stream()
                        .map(p -> new DischargeSurgeryProcedureDto(
                                p.getId(), p.getProcedureName(), p.getSurgeonName(), p.getAssistantSurgeonName(),
                                p.getAnaesthetistName(), p.getDateOfSurgery()))
                        .toList(),
                s.getCourseInHospital(),
                s.getAdviseDrugs().stream()
                        .map(d -> new DischargeAdviseDrugDto(
                                d.getId(), d.getDrugName(), d.getAdviseType(), d.getDose(), d.getMorning(),
                                d.getAfternoon(), d.getEvening(), d.getNight(), d.getRoute(), d.getRelationshipWithMeal(),
                                d.getDuration()))
                        .toList(),
                s.getReview(),
                s.getDietAdvice(),
                s.getPhysiotherapy(),
                s.getPhysicalActivity(),
                s.getAdvice(),
                s.getReviewDescription(),
                s.getConditionAtDischarge(),
                s.getEmergencyContactNumbers(),
                splitLines(s.getEmergencySymptomsText()),
                s.getCheckedBy(),
                s.getConsultantSignOff());
    }
}
