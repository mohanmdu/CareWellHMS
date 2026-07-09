package com.pms.insurance.service;

import com.pms.common.EntityNotFoundException;
import com.pms.insurance.dto.InsuranceClaimDto;
import com.pms.insurance.entity.InsuranceClaim;
import com.pms.insurance.entity.InsuranceClaimStatus;
import com.pms.insurance.repository.InsuranceClaimRepository;
import com.pms.registration.entity.Patient;
import com.pms.registration.repository.PatientRepository;
import java.time.Year;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Replaces IPAction.risePreAuthorization/riseEnhancement and
 * insuranceApprove/insuranceCancel, whose legacy DAO built approval-update
 * HQL via string concatenation - migration doc §4.5, risk R9. Parameterized
 * JPA operations here close that injection surface.
 */
@Service
@Transactional(readOnly = true)
public class InsuranceClaimService {

    private final InsuranceClaimRepository repository;
    private final PatientRepository patientRepository;
    private final AtomicInteger sequence = new AtomicInteger(0);

    public InsuranceClaimService(InsuranceClaimRepository repository, PatientRepository patientRepository) {
        this.repository = repository;
        this.patientRepository = patientRepository;
        this.sequence.set((int) repository.count());
    }

    public List<InsuranceClaimDto> findAll() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public InsuranceClaimDto create(InsuranceClaimDto dto) {
        Patient patient = patientRepository.findById(dto.patientId())
                .orElseThrow(() -> new EntityNotFoundException("Patient not found: " + dto.patientId()));

        InsuranceClaim claim = new InsuranceClaim();
        claim.setClaimNumber(nextClaimNumber());
        claim.setPatient(patient);
        claim.setPolicyNumber(dto.policyNumber());
        claim.setInsurerName(dto.insurerName());
        claim.setClaimType(dto.claimType());
        claim.setRequestedAmount(dto.requestedAmount());
        claim.setStatus(InsuranceClaimStatus.PENDING);

        return toDto(repository.save(claim));
    }

    @Transactional
    public InsuranceClaimDto approve(Long id, double approvedAmount) {
        InsuranceClaim claim = requirePending(id);
        claim.setStatus(InsuranceClaimStatus.APPROVED);
        claim.setApprovedAmount(approvedAmount);
        return toDto(repository.save(claim));
    }

    @Transactional
    public InsuranceClaimDto reject(Long id, String reason) {
        InsuranceClaim claim = requirePending(id);
        claim.setStatus(InsuranceClaimStatus.REJECTED);
        claim.setDecisionReason(reason);
        return toDto(repository.save(claim));
    }

    @Transactional
    public InsuranceClaimDto cancel(Long id, String reason) {
        InsuranceClaim claim = requirePending(id);
        claim.setStatus(InsuranceClaimStatus.CANCELLED);
        claim.setDecisionReason(reason);
        return toDto(repository.save(claim));
    }

    private InsuranceClaim requirePending(Long id) {
        InsuranceClaim claim = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Insurance claim not found: " + id));
        if (claim.getStatus() != InsuranceClaimStatus.PENDING) {
            throw new IllegalArgumentException("Claim " + claim.getClaimNumber() + " is already " + claim.getStatus());
        }
        return claim;
    }

    private String nextClaimNumber() {
        return "INS-" + Year.now().getValue() + "-" + String.format("%05d", sequence.incrementAndGet());
    }

    private InsuranceClaimDto toDto(InsuranceClaim claim) {
        Patient patient = claim.getPatient();
        return new InsuranceClaimDto(
                claim.getId(),
                claim.getClaimNumber(),
                patient.getId(),
                (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim(),
                claim.getPolicyNumber(),
                claim.getInsurerName(),
                claim.getClaimType(),
                claim.getRequestedAmount(),
                claim.getApprovedAmount(),
                claim.getStatus(),
                claim.getDecisionReason());
    }
}
