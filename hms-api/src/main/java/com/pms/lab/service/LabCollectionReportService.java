package com.pms.lab.service;

import com.pms.lab.dto.LabCancelledReportRowDto;
import com.pms.lab.dto.LabCollectionReportDto;
import com.pms.lab.dto.LabCollectionReportRowDto;
import com.pms.lab.dto.LabCollectionReportTotalsDto;
import com.pms.lab.entity.LabPaymentMode;
import com.pms.lab.entity.LabRequisition;
import com.pms.lab.entity.LabRequisitionItem;
import com.pms.lab.entity.LabRequisitionStatus;
import com.pms.lab.repository.LabCategoryRepository;
import com.pms.lab.repository.LabRequisitionRepository;
import com.pms.masters.entity.Consultant;
import com.pms.masters.repository.OpBillingCategoryRepository;
import com.pms.registration.entity.Patient;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Backs the three billing collection reports for Lab & Investigations:
 * Summary (all billed requisitions, no type filter), Lab Detail
 * (requisitionType "Labtest" only), and Investigation Detail
 * (requisitionType "Billing" only - the ad-hoc/OP-Billing-Catalog-sourced
 * items from LabRequisitionService.create()). All three share one
 * repository query and row shape; only the fixed requisitionType and the
 * optional filters differ.
 *
 * Doctor Referral Amount is always 0 here: no referral-fee concept or field
 * exists anywhere for LabRequisition. Refund Amount, by contrast, is real -
 * it reads LabRequisition.refundAmount, stamped by LabRefundService.create()
 * the same way com.pms.registration's Refund flow stamps Appointment/
 * OpDirectBilling.refundAmount.
 */
@Service
@Transactional(readOnly = true)
public class LabCollectionReportService {

    private final LabRequisitionRepository requisitionRepository;
    private final LabCategoryRepository labCategoryRepository;
    private final OpBillingCategoryRepository opBillingCategoryRepository;

    public LabCollectionReportService(
            LabRequisitionRepository requisitionRepository,
            LabCategoryRepository labCategoryRepository,
            OpBillingCategoryRepository opBillingCategoryRepository) {
        this.requisitionRepository = requisitionRepository;
        this.labCategoryRepository = labCategoryRepository;
        this.opBillingCategoryRepository = opBillingCategoryRepository;
    }

    public LabCollectionReportDto summary(LocalDate from, LocalDate to) {
        return build(from, to, null, null, null, null, false);
    }

    public LabCollectionReportDto labDetail(LocalDate from, LocalDate to, Long consultantId, Long categoryId, LabPaymentMode paymentMode) {
        String categoryName = categoryId != null
                ? labCategoryRepository.findById(categoryId).map(c -> c.getName()).orElse(null)
                : null;
        return build(from, to, "Labtest", consultantId, paymentMode, categoryName, false);
    }

    public LabCollectionReportDto investigationDetail(
            LocalDate from, LocalDate to, Long consultantId, Long categoryId, LabPaymentMode paymentMode) {
        String categoryName = categoryId != null
                ? opBillingCategoryRepository.findById(categoryId).map(c -> c.getName()).orElse(null)
                : null;
        return build(from, to, "Billing", consultantId, paymentMode, categoryName, true);
    }

    private LabCollectionReportDto build(
            LocalDate from,
            LocalDate to,
            String requisitionType,
            Long consultantId,
            LabPaymentMode paymentMode,
            String categoryName,
            boolean typeLabelFromItems) {
        LocalDateTime fromDateTime = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDateTime = to != null ? to.plusDays(1).atStartOfDay() : null;
        List<LabRequisition> requisitions = requisitionRepository.findForCollectionReport(
                LabRequisitionStatus.APPROVED, fromDateTime, toDateTime, requisitionType, consultantId, paymentMode, categoryName);
        List<LabCollectionReportRowDto> rows = requisitions.stream().map(r -> toRow(r, typeLabelFromItems)).toList();
        return new LabCollectionReportDto(rows, totals(rows));
    }

    private LabCollectionReportRowDto toRow(LabRequisition r, boolean typeLabelFromItems) {
        Patient patient = r.getPatient();
        Consultant consultant = r.getConsultant();
        String typeLabel = typeLabelFromItems
                ? r.getItems().stream().map(LabRequisitionItem::getCategoryName).distinct().collect(Collectors.joining(", "))
                : r.getRequisitionType();
        double paid = r.getPaidAmount() != null ? r.getPaidAmount() : 0.0;
        double discount = r.getDiscountAmount() != null ? r.getDiscountAmount() : 0.0;
        double refund = r.getRefundAmount() != null ? r.getRefundAmount() : 0.0;
        return new LabCollectionReportRowDto(
                r.getId(),
                patientDisplayName(patient),
                patient.getRegistrationNumber(),
                typeLabel,
                r.getApprovedAt(),
                r.getPaymentMode() != null ? r.getPaymentMode().name() : null,
                consultant != null ? consultant.getName() : null,
                r.getApprovedBy(),
                r.getInvoiceNumber(),
                r.getTotalAmount(),
                0.0,
                discount,
                paid,
                refund);
    }

    private LabCollectionReportTotalsDto totals(List<LabCollectionReportRowDto> rows) {
        double invoiceAmount = rows.stream().mapToDouble(LabCollectionReportRowDto::invoiceAmount).sum();
        double doctorReferralAmount = rows.stream().mapToDouble(LabCollectionReportRowDto::doctorReferralAmount).sum();
        double discountAmount = rows.stream().mapToDouble(LabCollectionReportRowDto::discountAmount).sum();
        double receiptAmount = rows.stream().mapToDouble(LabCollectionReportRowDto::receiptAmount).sum();
        double refundAmount = rows.stream().mapToDouble(LabCollectionReportRowDto::refundAmount).sum();
        return new LabCollectionReportTotalsDto(
                invoiceAmount, doctorReferralAmount, discountAmount, receiptAmount, refundAmount, receiptAmount - refundAmount);
    }

    private String patientDisplayName(Patient patient) {
        return (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim();
    }

    /**
     * Requisitions cancelled while still PENDING never reach approve(), so
     * invoiceNumber/paidAmount are always null here - the report legitimately
     * shows a blank Invoice No, not a bug.
     */
    public List<LabCancelledReportRowDto> cancelledReport() {
        return requisitionRepository.findByStatusOrderByRequisitionDateDesc(LabRequisitionStatus.CANCELLED).stream()
                .map(this::toCancelledRow)
                .toList();
    }

    private LabCancelledReportRowDto toCancelledRow(LabRequisition r) {
        Patient patient = r.getPatient();
        String typeLabel = "Billing".equals(r.getRequisitionType())
                ? r.getItems().stream().map(LabRequisitionItem::getCategoryName).distinct().collect(Collectors.joining(", "))
                : r.getRequisitionType();
        return new LabCancelledReportRowDto(
                r.getId(), patient.getRegistrationNumber(), patientDisplayName(patient), r.getInvoiceNumber(), typeLabel, r.getTotalAmount(), r.getRequisitionDate());
    }
}
