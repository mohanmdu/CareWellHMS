package com.pms.cashier.service;

import com.pms.cashier.dto.AdvanceReportRowDto;
import com.pms.cashier.dto.IpPaymentRequestDto;
import com.pms.cashier.entity.IpPaymentRequest;
import com.pms.cashier.entity.PaymentRequestStatus;
import com.pms.cashier.entity.PaymentRequestType;
import com.pms.cashier.repository.IpPaymentRequestRepository;
import com.pms.common.EntityNotFoundException;
import com.pms.ipadmission.entity.Admission;
import com.pms.ipadmission.repository.AdmissionRepository;
import com.pms.ipadmission.service.AdmissionService;
import com.pms.ipbilling.entity.IpPayment;
import com.pms.registration.entity.Patient;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Cashier Approval Workflow (PDF): a patient-side request ("Amount Received"
 * on the billing page) queues here PENDING until a cashier picks a payment
 * mode and approves it, which records the actual IpPayment ledger row.
 */
@Service
@Transactional(readOnly = true)
public class IpPaymentRequestService {

    private static final String[] REQUEST_TYPE_LABELS = {"Advance", "Final Settlement", "Due Amount"};

    private final IpPaymentRequestRepository repository;
    private final AdmissionRepository admissionRepository;
    private final AdmissionService admissionService;

    public IpPaymentRequestService(
            IpPaymentRequestRepository repository,
            AdmissionRepository admissionRepository,
            AdmissionService admissionService) {
        this.repository = repository;
        this.admissionRepository = admissionRepository;
        this.admissionService = admissionService;
    }

    public List<IpPaymentRequestDto> listPending() {
        return repository.findByStatusOrderByRequestedAtDesc(PaymentRequestStatus.PENDING).stream()
                .map(this::toDto)
                .toList();
    }

    public long countPending() {
        return repository.countByStatus(PaymentRequestStatus.PENDING);
    }

    public IpPaymentRequestDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    @Transactional
    public IpPaymentRequestDto create(Long admissionId, PaymentRequestType requestType, double amount, String description) {
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new EntityNotFoundException("Admission not found: " + admissionId));

        IpPaymentRequest request = new IpPaymentRequest();
        request.setAdmission(admission);
        request.setRequestType(requestType);
        request.setAmount(amount);
        request.setDescription(description);
        request.setStatus(PaymentRequestStatus.PENDING);
        request.setRequestedAt(Instant.now());
        request.setRequestedBy(currentUsername());

        return toDto(repository.save(request));
    }

    @Transactional
    public IpPaymentRequestDto approve(Long id, String paymentMode) {
        IpPaymentRequest request = getOrThrow(id);
        if (request.getStatus() != PaymentRequestStatus.PENDING) {
            throw new IllegalArgumentException("Payment request has already been processed");
        }

        IpPayment payment = admissionService.recordCashierPayment(
                request.getAdmission().getId(), request.getAmount(), requestTypeLabel(request.getRequestType()), paymentMode);

        request.setStatus(PaymentRequestStatus.APPROVED);
        request.setPaymentMode(paymentMode);
        request.setApprovedAt(Instant.now());
        request.setApprovedBy(currentUsername());
        request.setIpPayment(payment);

        return toDto(repository.save(request));
    }

    /** Advance Report: every approved cashier request in a date range, one row per request. */
    public List<AdvanceReportRowDto> getAdvanceReport(LocalDate fromDate, LocalDate toDate) {
        Instant fromInstant = fromDate != null ? fromDate.atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        Instant toInstant = toDate != null ? toDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        return repository.findApprovedForReport(fromInstant, toInstant).stream().map(this::toAdvanceReportRow).toList();
    }

    private AdvanceReportRowDto toAdvanceReportRow(IpPaymentRequest request) {
        Admission admission = request.getAdmission();
        Patient patient = admission.getPatient();
        double advance = request.getRequestType() == PaymentRequestType.ADVANCE ? request.getAmount() : 0;
        double finalSettlement = request.getRequestType() == PaymentRequestType.FINAL_SETTLEMENT ? request.getAmount() : 0;
        double dueAmount = request.getRequestType() == PaymentRequestType.DUE_AMOUNT ? request.getAmount() : 0;
        return new AdvanceReportRowDto(
                patient.getRegistrationNumber(),
                (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim(),
                patient.getGender(),
                admission.getAdmissionNumber(),
                request.getApprovedBy(),
                request.getApprovedAt(),
                advance,
                finalSettlement,
                dueAmount,
                request.getAmount());
    }

    private String requestTypeLabel(PaymentRequestType type) {
        return REQUEST_TYPE_LABELS[type.ordinal()];
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private IpPaymentRequest getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Payment request not found: " + id));
    }

    private IpPaymentRequestDto toDto(IpPaymentRequest request) {
        Admission admission = request.getAdmission();
        Patient patient = admission.getPatient();
        IpPayment payment = request.getIpPayment();
        return new IpPaymentRequestDto(
                request.getId(),
                admission.getId(),
                admission.getAdmissionNumber(),
                patient.getRegistrationNumber(),
                (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim(),
                patient.getGender(),
                patient.getAge(),
                admission.getHeightCm(),
                admission.getWeightKg(),
                patient.getAddress(),
                admission.getPrimaryConsultant(),
                request.getRequestType(),
                request.getAmount(),
                request.getDescription(),
                request.getStatus(),
                request.getPaymentMode(),
                request.getRequestedAt(),
                request.getRequestedBy(),
                request.getApprovedAt(),
                request.getApprovedBy(),
                payment != null ? payment.getId() : null,
                payment != null ? payment.getReceiptNumber() : null);
    }
}
