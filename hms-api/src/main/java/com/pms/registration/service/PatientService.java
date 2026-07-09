package com.pms.registration.service;

import com.pms.common.EntityNotFoundException;
import com.pms.registration.dto.PatientDto;
import com.pms.registration.entity.Patient;
import com.pms.registration.repository.PatientRepository;
import java.time.Year;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Replaces AdminAction.patientRegistration (see migration doc §4.1). The
 * legacy NF-ID generation logic is not visible outside AdminDaoImpl; this
 * uses a simple year-prefixed sequential registration number instead -
 * revisit against the real numbering scheme before this touches production
 * data (see docs/appendix for the full legacy action catalog).
 */
@Service
@Transactional(readOnly = true)
public class PatientService {

    private final PatientRepository repository;
    private final AtomicInteger sequence = new AtomicInteger(0);

    public PatientService(PatientRepository repository) {
        this.repository = repository;
        this.sequence.set((int) repository.count());
    }

    public List<PatientDto> search(String query) {
        List<Patient> patients = (query == null || query.isBlank())
                ? repository.findAll()
                : repository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(query, query);
        return patients.stream().map(this::toDto).toList();
    }

    public PatientDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    @Transactional
    public PatientDto register(PatientDto dto) {
        Patient patient = new Patient();
        patient.setRegistrationNumber(nextRegistrationNumber());
        applyFields(patient, dto);
        return toDto(repository.save(patient));
    }

    private String nextRegistrationNumber() {
        return "NF-" + Year.now().getValue() + "-" + String.format("%05d", sequence.incrementAndGet());
    }

    private void applyFields(Patient patient, PatientDto dto) {
        patient.setFirstName(dto.firstName());
        patient.setLastName(dto.lastName());
        patient.setDateOfBirth(dto.dateOfBirth());
        patient.setGender(dto.gender());
        patient.setMobileNumber(dto.mobileNumber());
        patient.setEmail(dto.email());
        patient.setAddress(dto.address());
    }

    private Patient getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Patient not found: " + id));
    }

    private PatientDto toDto(Patient patient) {
        return new PatientDto(
                patient.getId(),
                patient.getRegistrationNumber(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getDateOfBirth(),
                patient.getGender(),
                patient.getMobileNumber(),
                patient.getEmail(),
                patient.getAddress());
    }
}
