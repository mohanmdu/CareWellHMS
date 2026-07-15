package com.pms.pharmacy.service;

import com.pms.common.EntityNotFoundException;
import com.pms.pharmacy.dto.PharmacyRequestDto;
import com.pms.pharmacy.dto.PharmacyRequestItemDto;
import com.pms.pharmacy.dto.PharmacyRequestListEntryDto;
import com.pms.pharmacy.entity.PharmacyRequest;
import com.pms.pharmacy.entity.PharmacyRequestStatus;
import com.pms.pharmacy.repository.PharmacyRequestRepository;
import com.pms.registration.entity.Patient;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * No creation endpoint is exposed here - nothing in this codebase creates
 * PharmacyRequest rows yet (see its class doc). This service only supports
 * the read/search side of the "Drug Requests for Cashier Approval" queue,
 * plus markBilled(), called internally by PharmacySaleService once a
 * request has actually been billed.
 */
@Service
@Transactional(readOnly = true)
public class PharmacyRequestService {

    private final PharmacyRequestRepository repository;

    public PharmacyRequestService(PharmacyRequestRepository repository) {
        this.repository = repository;
    }

    public List<PharmacyRequestListEntryDto> findPending() {
        return repository.findByStatusOrderByCreatedAtDesc(PharmacyRequestStatus.PENDING).stream()
                .map(this::toListEntry)
                .toList();
    }

    public List<PharmacyRequestListEntryDto> findPendingForPatient(Long patientId) {
        return repository
                .findByPatientIdAndStatusOrderByCreatedAtDesc(patientId, PharmacyRequestStatus.PENDING)
                .stream()
                .map(this::toListEntry)
                .toList();
    }

    public PharmacyRequestDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    @Transactional
    public void markBilled(Long id) {
        PharmacyRequest request = getOrThrow(id);
        request.setStatus(PharmacyRequestStatus.BILLED);
        repository.save(request);
    }

    private PharmacyRequest getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pharmacy Request not found: " + id));
    }

    private PharmacyRequestListEntryDto toListEntry(PharmacyRequest request) {
        Patient patient = request.getPatient();
        return new PharmacyRequestListEntryDto(
                request.getId(),
                patient.getRegistrationNumber(),
                (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim(),
                request.getSource(),
                request.getStatus(),
                request.getCreatedBy(),
                request.getCreatedAt());
    }

    private PharmacyRequestDto toDto(PharmacyRequest request) {
        Patient patient = request.getPatient();
        List<PharmacyRequestItemDto> items = request.getItems().stream()
                .map(item -> new PharmacyRequestItemDto(
                        item.getId(), item.getProduct() != null ? item.getProduct().getId() : null, item.getDrugName(), item.getQty()))
                .toList();
        return new PharmacyRequestDto(
                request.getId(),
                patient.getId(),
                patient.getRegistrationNumber(),
                (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim(),
                patient.getMobileNumber(),
                request.getSource(),
                request.getStatus(),
                items,
                request.getCreatedBy(),
                request.getCreatedAt());
    }
}
