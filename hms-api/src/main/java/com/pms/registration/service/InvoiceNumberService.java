package com.pms.registration.service;

import com.pms.lab.repository.LabRequisitionRepository;
import com.pms.registration.repository.AppointmentRepository;
import com.pms.registration.repository.OpDirectBillingRepository;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;

/**
 * Single shared invoice-number sequence for every billing source in the
 * system (appointment billing, OP Direct Billing, Lab Billing) - so every
 * invoice number is unique hospital-wide regardless of where it was issued.
 * Seeded from the highest invoice number already in any source table, not a
 * row count (a count would drift once multiple source tables exist).
 * In-memory/per-JVM like every other sequence in this codebase
 * (PatientService.nextRegistrationNumber, RefundRepository's refund number) -
 * not safe across multiple app instances, consistent with this codebase's
 * provisional local-dev posture.
 */
@Service
public class InvoiceNumberService {

    private final AtomicLong sequence;

    public InvoiceNumberService(
            AppointmentRepository appointmentRepository,
            OpDirectBillingRepository opDirectBillingRepository,
            LabRequisitionRepository labRequisitionRepository) {
        long maxAppointmentInvoice = valueOrZero(appointmentRepository.findMaxInvoiceNumber());
        long maxDirectBillingInvoice = valueOrZero(opDirectBillingRepository.findMaxInvoiceNumber());
        long maxLabInvoice = valueOrZero(labRequisitionRepository.findMaxInvoiceNumber());
        this.sequence = new AtomicLong(Math.max(Math.max(maxAppointmentInvoice, maxDirectBillingInvoice), maxLabInvoice));
    }

    private static long valueOrZero(Long value) {
        return value != null ? value : 0L;
    }

    public long next() {
        return sequence.incrementAndGet();
    }

    /** Doesn't reserve the number - see AppointmentService.peekNextInvoiceNumber's existing caveat. */
    public long peekNext() {
        return sequence.get() + 1;
    }
}
