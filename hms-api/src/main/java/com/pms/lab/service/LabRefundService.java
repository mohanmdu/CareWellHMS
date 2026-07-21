package com.pms.lab.service;

import com.pms.common.EntityNotFoundException;
import com.pms.lab.dto.LabRefundCandidateDto;
import com.pms.lab.dto.LabRefundReceiptEntryDto;
import com.pms.lab.dto.LabRefundRequestDto;
import com.pms.lab.entity.LabRefund;
import com.pms.lab.entity.LabRequisition;
import com.pms.lab.repository.LabRefundRepository;
import com.pms.lab.repository.LabRequisitionRepository;
import com.pms.registration.entity.Patient;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Payment Refund module for Lab & Investigations: search a billed
 * (APPROVED) LabRequisition by Invoice No, approve a single refund against
 * it, and report on refunds - mirrors com.pms.registration.service.RefundService
 * one layer down (Lab has only one billing source, so no dual-source
 * branching is needed). A refund doesn't change the requisition's status; it
 * only stamps LabRequisition.refundAmount so LabCollectionReportService's
 * totals (which read that same field) already reflect it.
 */
@Service
@Transactional(readOnly = true)
public class LabRefundService {

    private final LabRequisitionRepository requisitionRepository;
    private final LabRefundRepository refundRepository;

    public LabRefundService(LabRequisitionRepository requisitionRepository, LabRefundRepository refundRepository) {
        this.requisitionRepository = requisitionRepository;
        this.refundRepository = refundRepository;
    }

    public LabRefundCandidateDto searchByInvoiceNumber(Long invoiceNumber) {
        LabRequisition requisition = requisitionRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new EntityNotFoundException("No billed invoice found for Invoice No " + invoiceNumber));
        LabRefund existing = refundRepository.findByRequisitionId(requisition.getId()).orElse(null);
        Patient patient = requisition.getPatient();
        return new LabRefundCandidateDto(
                requisition.getId(),
                patientDisplayName(patient),
                patient.getRegistrationNumber(),
                requisition.getInvoiceNumber(),
                requisition.getTotalAmount(),
                requisition.getPaidAmount(),
                requisition.getCreatedBy(),
                existing != null,
                existing != null ? existing.getRefundNumber() : null,
                existing != null ? existing.getRefundAmount() : null,
                existing != null ? existing.getRefundedAt() : null);
    }

    @Transactional
    public LabRefundReceiptEntryDto create(LabRefundRequestDto request) {
        LabRequisition requisition = requisitionRepository.findById(request.requisitionId())
                .orElseThrow(() -> new EntityNotFoundException("Lab requisition not found: " + request.requisitionId()));
        if (requisition.getInvoiceNumber() == null) {
            throw new IllegalArgumentException("This requisition hasn't been billed yet.");
        }
        if (refundRepository.existsByRequisitionId(requisition.getId())) {
            throw new IllegalArgumentException("Invoice No " + requisition.getInvoiceNumber() + " has already been refunded.");
        }
        double paid = requisition.getPaidAmount() != null ? requisition.getPaidAmount() : 0.0;
        if (request.refundAmount() <= 0 || request.refundAmount() > paid) {
            throw new IllegalArgumentException("Refund amount must be greater than 0 and no more than the paid amount.");
        }

        LabRefund refund = new LabRefund();
        refund.setRequisition(requisition);
        refund.setRefundNumber(refundRepository.findTopByOrderByRefundNumberDesc().map(r -> r.getRefundNumber() + 1).orElse(1L));
        refund.setRefundAmount(request.refundAmount());
        refund.setReason(request.reason());
        refund.setRefundedBy(currentUsername());
        refund.setRefundedAt(LocalDateTime.now());

        requisition.setRefundAmount(request.refundAmount());
        requisitionRepository.save(requisition);

        return toReceiptEntry(refundRepository.save(refund));
    }

    public List<LabRefundReceiptEntryDto> report(LocalDate from, LocalDate to) {
        LocalDateTime fromDateTime = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDateTime = to != null ? to.plusDays(1).atStartOfDay() : null;
        return refundRepository.report(fromDateTime, toDateTime).stream().map(this::toReceiptEntry).toList();
    }

    public LabRefundReceiptEntryDto getReceipt(Long refundId) {
        LabRefund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new EntityNotFoundException("Lab refund not found: " + refundId));
        return toReceiptEntry(refund);
    }

    private LabRefundReceiptEntryDto toReceiptEntry(LabRefund refund) {
        LabRequisition requisition = refund.getRequisition();
        Patient patient = requisition.getPatient();
        return new LabRefundReceiptEntryDto(
                refund.getId(),
                requisition.getId(),
                refund.getRefundNumber(),
                patientDisplayName(patient),
                patient.getRegistrationNumber(),
                patient.getGender(),
                patient.getAge(),
                requisition.getPatientType(),
                requisition.getRequisitionType(),
                requisition.getInvoiceNumber(),
                requisition.getTotalAmount(),
                requisition.getPaidAmount(),
                refund.getRefundAmount(),
                refund.getReason(),
                requisition.getApprovedAt(),
                refund.getRefundedAt(),
                refund.getRefundedBy());
    }

    private String patientDisplayName(Patient patient) {
        return (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim();
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }
}
