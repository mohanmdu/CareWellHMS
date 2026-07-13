package com.pms.registration.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Audit trail for Appointment lifecycle changes (create/confirm/cancel/bill -
 * see AppointmentService.recordAudit), mirroring PatientAuditLog's
 * denormalized-snapshot approach but extended with JSON before/after
 * snapshots since an appointment has many change-relevant fields.
 */
@Entity
@Table(name = "appointment_audit_log")
@Getter
@Setter
@NoArgsConstructor
public class AppointmentAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Column(nullable = false, length = 32)
    private String operation;

    @Column(name = "patient_name")
    private String patientName;

    @Column(name = "consultant_name")
    private String consultantName;

    @Column(name = "department_name")
    private String departmentName;

    @Column(name = "appointment_date")
    private LocalDate appointmentDate;

    @Column(name = "slot_time")
    private LocalTime slotTime;

    @Column(nullable = false, length = 20)
    private String channel = "web";

    @Column(name = "previous_value", columnDefinition = "TEXT")
    private String previousValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "performed_by", length = 100)
    private String performedBy;

    @Column(name = "performed_at", nullable = false)
    private Instant performedAt;
}
