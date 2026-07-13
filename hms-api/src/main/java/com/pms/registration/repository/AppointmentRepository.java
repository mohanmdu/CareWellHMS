package com.pms.registration.repository;

import com.pms.registration.entity.Appointment;
import com.pms.registration.entity.AppointmentStatus;
import com.pms.registration.entity.PaymentMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByAppointmentDate(LocalDate appointmentDate);

    // Payment Refund's search-by-invoice-number step.
    Optional<Appointment> findByInvoiceNumber(Long invoiceNumber);

    // Excludes CANCELLED so a cancelled appointment doesn't permanently block
    // re-booking the same slot (book()'s collision guard).
    List<Appointment> findByConsultantIdAndAppointmentDateAndSlotTimeAndStatusNot(
            Long consultantId, LocalDate appointmentDate, java.time.LocalTime slotTime, AppointmentStatus excludedStatus);

    List<Appointment> findByConsultantIdAndAppointmentDateAndStatusNot(
            Long consultantId, LocalDate appointmentDate, AppointmentStatus excludedStatus);

    // Night sessions wrap past midnight, so a single queried date's slots can
    // land on either that date or the next one - callers pass both.
    List<Appointment> findByConsultantIdAndAppointmentDateInAndStatusNot(
            Long consultantId, List<LocalDate> appointmentDates, AppointmentStatus excludedStatus);

    @Query("""
            SELECT a FROM Appointment a
            WHERE (:status IS NULL OR a.status = :status)
              AND (:fromDate IS NULL OR a.appointmentDate >= :fromDate)
              AND (:toDate IS NULL OR a.appointmentDate <= :toDate)
              AND (:departmentId IS NULL OR a.consultant.department.id = :departmentId)
              AND (:patientId IS NULL OR a.patient.id = :patientId)
            ORDER BY a.appointmentDate DESC, a.slotTime DESC
            """)
    List<Appointment> search(
            @Param("status") AppointmentStatus status,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("departmentId") Long departmentId,
            @Param("patientId") Long patientId);

    // Seeds InvoiceNumberService's shared sequence at startup - MAX rather
    // than a row count, since the sequence is now shared with OP Direct
    // Billing and a simple count would no longer track the true high-water mark.
    @Query("SELECT MAX(a.invoiceNumber) FROM Appointment a")
    Long findMaxInvoiceNumber();

    @Query("""
            SELECT a FROM Appointment a
            WHERE a.status = com.pms.registration.entity.AppointmentStatus.COMPLETED
              AND (:fromInstant IS NULL OR a.billedAt >= :fromInstant)
              AND (:toInstant IS NULL OR a.billedAt < :toInstant)
              AND (:consultantId IS NULL OR a.consultant.id = :consultantId)
              AND (:paymentMode IS NULL OR a.paymentMode = :paymentMode)
            ORDER BY a.billedAt DESC
            """)
    List<Appointment> collectionReport(
            @Param("fromInstant") Instant fromInstant,
            @Param("toInstant") Instant toInstant,
            @Param("consultantId") Long consultantId,
            @Param("paymentMode") PaymentMode paymentMode);

    // Patient Prescription worklist - excludes CANCELLED (nothing to document
    // for a cancelled visit) and matches free text against name/PID/mobile,
    // the same three fields PatientRepository.searchActive() matches.
    @Query("""
            SELECT a FROM Appointment a
            WHERE a.status <> com.pms.registration.entity.AppointmentStatus.CANCELLED
              AND (:fromDate IS NULL OR a.appointmentDate >= :fromDate)
              AND (:toDate IS NULL OR a.appointmentDate <= :toDate)
              AND (:consultantId IS NULL OR a.consultant.id = :consultantId)
              AND (:search IS NULL OR :search = ''
                   OR LOWER(a.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(a.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(a.patient.registrationNumber) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR a.patient.mobileNumber LIKE CONCAT('%', :search, '%'))
            ORDER BY a.appointmentDate DESC, a.slotTime DESC
            """)
    List<Appointment> prescriptionWorklist(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("consultantId") Long consultantId,
            @Param("search") String search);
}
