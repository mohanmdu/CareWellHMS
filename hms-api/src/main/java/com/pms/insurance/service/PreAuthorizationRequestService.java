package com.pms.insurance.service;

import com.pms.common.EntityNotFoundException;
import com.pms.insurance.dto.PreAuthorizationRequestAmendDto;
import com.pms.insurance.dto.PreAuthorizationRequestApproveDto;
import com.pms.insurance.dto.PreAuthorizationRequestCreateDto;
import com.pms.insurance.dto.PreAuthorizationRequestDto;
import com.pms.insurance.dto.PreAuthorizationRequestRaiseDto;
import com.pms.insurance.dto.PreAuthorizationRequestRejectDto;
import com.pms.insurance.entity.PreAuthorizationRequest;
import com.pms.insurance.entity.PreAuthorizationStatus;
import com.pms.insurance.repository.PreAuthorizationRequestRepository;
import com.pms.ipadmission.entity.Admission;
import com.pms.registration.entity.Patient;
import com.pms.registration.repository.PatientRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The Insurance Module's Pre Authorization Request worklist. A request
 * either arrives auto-seeded from an Admission (IP Admission Advice's
 * "Create" action, when insuranceType != "None" - see seedFromAdmission(),
 * status YET_TO_BE_RAISED since the admission form never collects a real
 * policy number) or is raised directly by staff via create() (status
 * PENDING immediately, no admission link).
 */
@Service
@Transactional(readOnly = true)
public class PreAuthorizationRequestService {

    private final PreAuthorizationRequestRepository repository;
    private final PatientRepository patientRepository;
    private final AtomicInteger sequence = new AtomicInteger(0);

    public PreAuthorizationRequestService(PreAuthorizationRequestRepository repository, PatientRepository patientRepository) {
        this.repository = repository;
        this.patientRepository = patientRepository;
        this.sequence.set((int) repository.count());
    }

    public List<PreAuthorizationRequestDto> findAll() {
        return repository.findAllByOrderByIdDesc().stream().map(this::toDto).toList();
    }

    /** Insurance Approval Queue: requests actually raised and awaiting a decision. */
    public List<PreAuthorizationRequestDto> findPending() {
        return repository.findByStatus(PreAuthorizationStatus.PENDING).stream().map(this::toDto).toList();
    }

    /** Insurance Claim Report: requests already decided APPROVED, optionally filtered. */
    public List<PreAuthorizationRequestDto> findApprovedReport(LocalDate from, LocalDate to, String insurerName, String patientUhid) {
        LocalDateTime fromDateTime = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDateTime = to != null ? to.plusDays(1).atStartOfDay() : null;
        return repository.findApprovedForReport(fromDateTime, toDateTime, insurerName, patientUhid).stream()
                .map(this::toDto)
                .toList();
    }

    /** Insurance Rejected Report: requests already decided REJECTED, optionally filtered. */
    public List<PreAuthorizationRequestDto> findRejectedReport(LocalDate from, LocalDate to, String insurerName, String patientUhid) {
        LocalDateTime fromDateTime = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDateTime = to != null ? to.plusDays(1).atStartOfDay() : null;
        return repository.findRejectedForReport(fromDateTime, toDateTime, insurerName, patientUhid).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public PreAuthorizationRequestDto create(PreAuthorizationRequestCreateDto dto) {
        Patient patient = patientRepository.findById(dto.patientId())
                .orElseThrow(() -> new EntityNotFoundException("Patient not found: " + dto.patientId()));

        PreAuthorizationRequest request = new PreAuthorizationRequest();
        request.setRequestNumber(nextRequestNumber());
        request.setPatient(patient);
        request.setPolicyNumber(dto.policyNumber());
        request.setCardNumber(dto.cardNumber());
        request.setInsurerName(dto.insurerName());
        request.setTpaName(dto.tpaName());
        request.setCorporateName(dto.corporateName());
        request.setRequestedAmount(dto.requestedAmount());
        request.setStatus(PreAuthorizationStatus.PENDING);
        request.setRaisedAt(LocalDateTime.now());
        request.setRaisedBy(currentUsername());

        return toDto(repository.save(request));
    }

    /**
     * Cross-module hook called by AdmissionService.register() (IP Admission
     * Advice's "Create" action): if the admission's insuranceType isn't
     * "None", seeds a skeleton request so it shows up in this worklist
     * immediately, status YET_TO_BE_RAISED since neither a policy number nor
     * a confirmed insurer have been collected yet (the admission form only
     * captures TPA/Corporate/Insurance Company names) - see raise() for how
     * staff complete it.
     */
    @Transactional
    public void seedFromAdmission(Admission admission) {
        String insuranceType = admission.getInsuranceType();
        if (insuranceType == null || "None".equalsIgnoreCase(insuranceType.trim())) {
            return;
        }
        PreAuthorizationRequest request = new PreAuthorizationRequest();
        request.setRequestNumber(nextRequestNumber());
        request.setPatient(admission.getPatient());
        request.setAdmission(admission);
        request.setInsurerName(admission.getInsuranceCompany());
        request.setTpaName(admission.getTpaName());
        request.setCorporateName(admission.getCorporateName());
        request.setRequestedAmount(0.0);
        request.setStatus(PreAuthorizationStatus.YET_TO_BE_RAISED);
        repository.save(request);
    }

    /** Confirms the real policy/card/estimated-amount for a YET_TO_BE_RAISED request and actually submits it. */
    @Transactional
    public PreAuthorizationRequestDto raise(Long id, PreAuthorizationRequestRaiseDto dto) {
        PreAuthorizationRequest request = getOrThrow(id);
        if (request.getStatus() != PreAuthorizationStatus.YET_TO_BE_RAISED) {
            throw new IllegalArgumentException("Request " + request.getRequestNumber() + " has already been raised.");
        }
        request.setPolicyNumber(dto.policyNumber());
        request.setCardNumber(dto.cardNumber());
        request.setRequestedAmount(dto.requestedAmount());
        request.setStatus(PreAuthorizationStatus.PENDING);
        request.setRaisedAt(LocalDateTime.now());
        request.setRaisedBy(currentUsername());
        return toDto(repository.save(request));
    }

    @Transactional
    public PreAuthorizationRequestDto approve(Long id, PreAuthorizationRequestApproveDto dto) {
        PreAuthorizationRequest request = requirePending(id);
        request.setStatus(PreAuthorizationStatus.APPROVED);
        request.setApprovedAmount(dto.approvedAmount());
        request.setDecisionReason(dto.reason());
        request.setDecidedAt(dto.decidedDate().atStartOfDay());
        request.setApprovedBy(currentUsername());
        return toDto(repository.save(request));
    }

    @Transactional
    public PreAuthorizationRequestDto reject(Long id, PreAuthorizationRequestRejectDto dto) {
        PreAuthorizationRequest request = requirePending(id);
        request.setStatus(PreAuthorizationStatus.REJECTED);
        request.setDecisionReason(dto.reason());
        request.setDecidedAt(dto.decidedDate().atStartOfDay());
        request.setApprovedBy(currentUsername());
        return toDto(repository.save(request));
    }

    /** "Change the Amount" (Insurance Claim Report) - corrects an already-decided request's figures; no status change. */
    @Transactional
    public PreAuthorizationRequestDto amend(Long id, PreAuthorizationRequestAmendDto dto) {
        PreAuthorizationRequest request = getOrThrow(id);
        request.setRequestedAmount(dto.requestedAmount());
        request.setApprovedAmount(dto.approvedAmount());
        request.setCardNumber(dto.cardNumber());
        request.setClaimNumber(dto.claimNumber());
        return toDto(repository.save(request));
    }

    /** Allowed from YET_TO_BE_RAISED too (unlike approve/reject) - a mistaken auto-seed shouldn't have to be raised with fake details just to be dismissed. */
    @Transactional
    public PreAuthorizationRequestDto cancel(Long id, String reason) {
        PreAuthorizationRequest request = getOrThrow(id);
        if (request.getStatus() != PreAuthorizationStatus.YET_TO_BE_RAISED && request.getStatus() != PreAuthorizationStatus.PENDING) {
            throw new IllegalArgumentException("Request " + request.getRequestNumber() + " is already " + request.getStatus());
        }
        request.setStatus(PreAuthorizationStatus.CANCELLED);
        request.setDecisionReason(reason);
        return toDto(repository.save(request));
    }

    private PreAuthorizationRequest requirePending(Long id) {
        PreAuthorizationRequest request = getOrThrow(id);
        if (request.getStatus() != PreAuthorizationStatus.PENDING) {
            throw new IllegalArgumentException("Request " + request.getRequestNumber() + " is already " + request.getStatus());
        }
        return request;
    }

    private PreAuthorizationRequest getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Pre authorization request not found: " + id));
    }

    private String nextRequestNumber() {
        return "PAR-" + Year.now().getValue() + "-" + String.format("%05d", sequence.incrementAndGet());
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private PreAuthorizationRequestDto toDto(PreAuthorizationRequest request) {
        Patient patient = request.getPatient();
        Admission admission = request.getAdmission();
        return new PreAuthorizationRequestDto(
                request.getId(),
                request.getRequestNumber(),
                patient.getId(),
                (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim(),
                patient.getRegistrationNumber(),
                patient.getGender(),
                patient.getAge(),
                admission != null ? admission.getMaritalStatus() : null,
                admission != null ? admission.getId() : null,
                admission != null ? admission.getAdmissionNumber() : null,
                admission != null ? admission.getAdmissionDate() : null,
                admission != null && admission.getPaymentType() != null ? admission.getPaymentType().name() : null,
                admission != null && admission.getRoom() != null ? admission.getRoom().getRoomNumber() : null,
                admission != null ? admission.getAttenderName() : null,
                admission != null ? admission.getRelationType() : null,
                admission != null ? admission.getRelationMobileNo() : null,
                admission != null ? admission.getReferralDoctor() : null,
                admission != null ? admission.getPrimaryConsultant() : null,
                request.getPolicyNumber(),
                request.getCardNumber(),
                request.getClaimNumber(),
                request.getInsurerName(),
                request.getTpaName(),
                request.getCorporateName(),
                request.getRequestedAmount(),
                request.getApprovedAmount(),
                request.getStatus(),
                request.getDecisionReason(),
                request.getRaisedAt(),
                request.getRaisedBy(),
                request.getDecidedAt(),
                request.getApprovedBy());
    }
}
