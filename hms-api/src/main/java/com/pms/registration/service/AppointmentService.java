package com.pms.registration.service;

import com.pms.common.EntityNotFoundException;
import com.pms.masters.entity.Consultant;
import com.pms.masters.repository.ConsultantRepository;
import com.pms.registration.dto.AppointmentDto;
import com.pms.registration.entity.Appointment;
import com.pms.registration.entity.AppointmentStatus;
import com.pms.registration.entity.Patient;
import com.pms.registration.repository.AppointmentRepository;
import com.pms.registration.repository.PatientRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Replaces the legacy appointment booking family (newAppointmentaction,
 * appointReqt, confirmreq) and collapses the ~10 near-duplicate cancel
 * methods in AdminAction into one cancel operation with a required reason
 * (migration doc §4.1).
 */
@Service
@Transactional(readOnly = true)
public class AppointmentService {

    private final AppointmentRepository repository;
    private final PatientRepository patientRepository;
    private final ConsultantRepository consultantRepository;

    public AppointmentService(
            AppointmentRepository repository,
            PatientRepository patientRepository,
            ConsultantRepository consultantRepository) {
        this.repository = repository;
        this.patientRepository = patientRepository;
        this.consultantRepository = consultantRepository;
    }

    public List<AppointmentDto> findAll() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    public AppointmentDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    @Transactional
    public AppointmentDto book(AppointmentDto dto) {
        Patient patient = patientRepository.findById(dto.patientId())
                .orElseThrow(() -> new EntityNotFoundException("Patient not found: " + dto.patientId()));
        Consultant consultant = consultantRepository.findById(dto.consultantId())
                .orElseThrow(() -> new EntityNotFoundException("Consultant not found: " + dto.consultantId()));

        boolean slotTaken = !repository
                .findByConsultantIdAndAppointmentDateAndSlotTime(dto.consultantId(), dto.appointmentDate(), dto.slotTime())
                .isEmpty();
        if (slotTaken) {
            throw new IllegalArgumentException(
                    "Consultant already has an appointment at " + dto.slotTime() + " on " + dto.appointmentDate());
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setConsultant(consultant);
        appointment.setAppointmentDate(dto.appointmentDate());
        appointment.setSlotTime(dto.slotTime());
        appointment.setNotes(dto.notes());
        appointment.setStatus(AppointmentStatus.BOOKED);
        return toDto(repository.save(appointment));
    }

    @Transactional
    public AppointmentDto confirm(Long id) {
        Appointment appointment = getOrThrow(id);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        return toDto(repository.save(appointment));
    }

    @Transactional
    public AppointmentDto cancel(Long id, String reason) {
        Appointment appointment = getOrThrow(id);
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(reason);
        return toDto(repository.save(appointment));
    }

    private Appointment getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found: " + id));
    }

    private AppointmentDto toDto(Appointment appointment) {
        Consultant consultant = appointment.getConsultant();
        Patient patient = appointment.getPatient();
        return new AppointmentDto(
                appointment.getId(),
                patient.getId(),
                (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim(),
                consultant.getId(),
                consultant.getName(),
                consultant.getDepartment().getName(),
                appointment.getAppointmentDate(),
                appointment.getSlotTime(),
                appointment.getStatus(),
                appointment.getNotes(),
                appointment.getCancellationReason());
    }
}
