package com.pms.icd.service;

import com.pms.icd.dto.PatientVisitSummaryDto;
import com.pms.ipadmission.entity.Admission;
import com.pms.ipadmission.repository.AdmissionRepository;
import com.pms.masters.entity.Consultant;
import com.pms.registration.entity.Appointment;
import com.pms.registration.entity.Patient;
import com.pms.registration.repository.AppointmentRepository;
import com.pms.registration.repository.PatientRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Backs the ICD Code Search screen's result table: reuses PatientRepository's
 * existing name/UHID/mobile search, then for each match derives Department,
 * Consultant, Patient Type (OP/IP) and Last Visit Date from whichever of the
 * patient's latest Appointment or latest Admission is more recent - Patient
 * itself carries no OP/IP flag, so this is computed rather than stored.
 *
 * Limitation, not fabricated: Admission.primaryConsultant is free text (no
 * FK to Consultant/Department in this codebase - see Admission entity), so an
 * IP-sourced row can show a consultant name but leaves Department blank
 * rather than guessing a department from a text match.
 */
@Service
@Transactional(readOnly = true)
public class PatientVisitSummaryService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final AdmissionRepository admissionRepository;

    public PatientVisitSummaryService(
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            AdmissionRepository admissionRepository) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.admissionRepository = admissionRepository;
    }

    public List<PatientVisitSummaryDto> search(String query) {
        List<Patient> patients = (query == null || query.isBlank())
                ? patientRepository.findByActiveTrueOrderByIdDesc()
                : patientRepository.searchActive(query);
        return patients.stream().map(this::toSummary).toList();
    }

    private PatientVisitSummaryDto toSummary(Patient patient) {
        Optional<Appointment> lastAppointment =
                appointmentRepository.findFirstByPatientIdOrderByAppointmentDateDescSlotTimeDesc(patient.getId());
        Optional<Admission> lastAdmission = admissionRepository.findFirstByPatientIdOrderByAdmissionDateDesc(patient.getId());

        LocalDate appointmentDate = lastAppointment.map(Appointment::getAppointmentDate).orElse(null);
        LocalDate admissionDate = lastAdmission.map(a -> a.getAdmissionDate().toLocalDate()).orElse(null);

        boolean useAdmission = admissionDate != null
                && (appointmentDate == null || !admissionDate.isBefore(appointmentDate));

        if (useAdmission) {
            Admission admission = lastAdmission.get();
            return new PatientVisitSummaryDto(
                    patient.getId(),
                    patient.getRegistrationNumber(),
                    displayName(patient),
                    patient.getGender(),
                    patient.getAge(),
                    patient.getMobileNumber(),
                    null,
                    admission.getPrimaryConsultant(),
                    "IP",
                    admission.getAdmissionNumber(),
                    admissionDate);
        }
        if (appointmentDate != null) {
            Appointment appointment = lastAppointment.get();
            Consultant consultant = appointment.getConsultant();
            return new PatientVisitSummaryDto(
                    patient.getId(),
                    patient.getRegistrationNumber(),
                    displayName(patient),
                    patient.getGender(),
                    patient.getAge(),
                    patient.getMobileNumber(),
                    consultant.getDepartment().getName(),
                    consultant.getName(),
                    "OP",
                    appointment.getInvoiceNumber() != null ? String.valueOf(appointment.getInvoiceNumber()) : null,
                    appointmentDate);
        }
        return new PatientVisitSummaryDto(
                patient.getId(),
                patient.getRegistrationNumber(),
                displayName(patient),
                patient.getGender(),
                patient.getAge(),
                patient.getMobileNumber(),
                null,
                null,
                null,
                null,
                null);
    }

    private String displayName(Patient patient) {
        return (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim();
    }
}
