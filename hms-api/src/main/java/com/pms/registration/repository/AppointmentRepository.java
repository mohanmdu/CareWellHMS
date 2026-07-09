package com.pms.registration.repository;

import com.pms.registration.entity.Appointment;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByAppointmentDate(LocalDate appointmentDate);

    List<Appointment> findByConsultantIdAndAppointmentDateAndSlotTime(
            Long consultantId, LocalDate appointmentDate, java.time.LocalTime slotTime);
}
