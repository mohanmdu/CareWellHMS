package com.pms.ipbilling.service;

import com.pms.activitylog.service.ActivityLogEntry;
import com.pms.activitylog.service.ActivityLogService;
import com.pms.common.EntityNotFoundException;
import com.pms.ipadmission.entity.Admission;
import com.pms.ipadmission.entity.AdmissionPaymentType;
import com.pms.ipadmission.entity.AdmissionRoomHistory;
import com.pms.ipadmission.entity.Room;
import com.pms.ipadmission.entity.RoomType;
import com.pms.ipadmission.repository.AdmissionRepository;
import com.pms.ipadmission.repository.AdmissionRoomHistoryRepository;
import com.pms.ipbilling.dto.AdmissionReportRowDto;
import com.pms.ipbilling.dto.CancelledAdmissionDetailDto;
import com.pms.ipbilling.dto.CancelledAdmissionRowDto;
import com.pms.ipbilling.dto.DischargeListRowDto;
import com.pms.ipbilling.dto.IpBillingLedgerDto;
import com.pms.ipbilling.dto.IpBillingLedgerRowDto;
import com.pms.ipbilling.dto.IpBillingLineItemDto;
import com.pms.ipbilling.dto.IpConsultantWiseReportRowDto;
import com.pms.ipbilling.dto.IpPaymentDto;
import com.pms.ipbilling.dto.WardStayDto;
import com.pms.ipbilling.entity.IpBillingLineItem;
import com.pms.ipbilling.entity.IpPayment;
import com.pms.ipbilling.repository.IpBillingLineItemRepository;
import com.pms.ipbilling.repository.IpPaymentRepository;
import com.pms.masters.entity.Consultant;
import com.pms.masters.entity.IpBillingCategory;
import com.pms.masters.entity.IpBillingComponent;
import com.pms.masters.repository.ConsultantRepository;
import com.pms.masters.repository.IpBillingCategoryRepository;
import com.pms.masters.repository.IpBillingComponentRepository;
import com.pms.registration.entity.Patient;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Patient Billing Advice / BILLING ledger (PDF p.11-12) - a bespoke per-admission
 * billing workspace, deliberately separate from the generic Invoice system
 * (which has no Admission link and is scoped to OP billing). Ward/Bed Charges
 * is computed from the admission's room rate x stay length rather than stored
 * as a line item, matching how the legacy screen always shows it first.
 */
@Service
@Transactional(readOnly = true)
public class IpBillingService {

    private static final String WARD_BED_CHARGES = "Ward/Bed Charges";

    private final IpBillingLineItemRepository lineItemRepository;
    private final IpPaymentRepository paymentRepository;
    private final AdmissionRepository admissionRepository;
    private final AdmissionRoomHistoryRepository roomHistoryRepository;
    private final IpBillingCategoryRepository categoryRepository;
    private final IpBillingComponentRepository componentRepository;
    private final ConsultantRepository consultantRepository;
    private final ActivityLogService activityLogService;

    public IpBillingService(
            IpBillingLineItemRepository lineItemRepository,
            IpPaymentRepository paymentRepository,
            AdmissionRepository admissionRepository,
            AdmissionRoomHistoryRepository roomHistoryRepository,
            IpBillingCategoryRepository categoryRepository,
            IpBillingComponentRepository componentRepository,
            ConsultantRepository consultantRepository,
            ActivityLogService activityLogService) {
        this.lineItemRepository = lineItemRepository;
        this.paymentRepository = paymentRepository;
        this.admissionRepository = admissionRepository;
        this.roomHistoryRepository = roomHistoryRepository;
        this.categoryRepository = categoryRepository;
        this.componentRepository = componentRepository;
        this.consultantRepository = consultantRepository;
        this.activityLogService = activityLogService;
    }

    public List<IpPaymentDto> listPayments(Long admissionId) {
        return paymentRepository.findByAdmissionIdOrderByPaymentDateDesc(admissionId).stream()
                .map(this::toPaymentDto)
                .toList();
    }

    public List<IpBillingLineItemDto> listLineItems(Long admissionId) {
        return lineItemRepository.findByAdmissionIdOrderByRequestedOnAsc(admissionId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public IpBillingLineItemDto addLineItem(Long admissionId, IpBillingLineItemDto dto) {
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new EntityNotFoundException("Admission not found: " + admissionId));
        IpBillingCategory category = categoryRepository.findById(dto.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("Billing category not found: " + dto.categoryId()));
        IpBillingComponent component = componentRepository.findById(dto.componentId())
                .orElseThrow(() -> new EntityNotFoundException("Billing component not found: " + dto.componentId()));
        Consultant consultant = resolveConsultant(dto.consultantId());

        IpBillingLineItem item = new IpBillingLineItem();
        item.setAdmission(admission);
        item.setCategory(category);
        item.setConsultant(consultant);
        item.setComponent(component);
        item.setRemarks(dto.remarks());
        item.setQuantity(dto.quantity() != null ? dto.quantity() : 1);
        item.setUnitAmount(dto.unitAmount() != null ? dto.unitAmount() : 0);
        item.setUnits(dto.units());
        item.setLineTotal(item.getQuantity() * item.getUnitAmount());
        item.setRequestedOn(Instant.now());
        item.setCreatedBy(currentUsername());

        IpBillingLineItem saved = lineItemRepository.save(item);
        activityLogService.log(new ActivityLogEntry("IP Billing", "Create")
                .content(component.getName() + " x" + saved.getQuantity() + " = " + saved.getLineTotal())
                .status("Success")
                .patient(admission.getPatient().getRegistrationNumber(), patientDisplayName(admission))
                .ipNumber(admission.getAdmissionNumber())
                .screenName("Patient Billing Advice"));
        return toDto(saved);
    }

    @Transactional
    public IpBillingLineItemDto updateLineItem(Long id, IpBillingLineItemDto dto) {
        IpBillingLineItem item = lineItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Billing line item not found: " + id));
        String previousContent = lineItemSummary(item);
        if (dto.remarks() != null) {
            item.setRemarks(dto.remarks());
        }
        if (dto.quantity() != null) {
            item.setQuantity(dto.quantity());
        }
        if (dto.unitAmount() != null) {
            item.setUnitAmount(dto.unitAmount());
        }
        if (dto.discountAmount() != null) {
            item.setDiscountAmount(dto.discountAmount());
        }
        if (dto.refundAmount() != null) {
            item.setRefundAmount(dto.refundAmount());
        }
        if (dto.discountReason() != null) {
            item.setDiscountReason(dto.discountReason());
        }
        item.setLineTotal(item.getQuantity() * item.getUnitAmount());
        IpBillingLineItem saved = lineItemRepository.save(item);
        Admission admission = saved.getAdmission();
        activityLogService.log(new ActivityLogEntry("IP Billing", "Update")
                .content(lineItemSummary(saved))
                .previousContent(previousContent)
                .status("Updated")
                .patient(admission.getPatient().getRegistrationNumber(), patientDisplayName(admission))
                .ipNumber(admission.getAdmissionNumber())
                .screenName("Patient Billing Advice"));
        return toDto(saved);
    }

    @Transactional
    public void deleteLineItem(Long id) {
        IpBillingLineItem item = lineItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Billing line item not found: " + id));
        Admission admission = item.getAdmission();
        String content = lineItemSummary(item);
        lineItemRepository.deleteById(id);
        activityLogService.log(new ActivityLogEntry("IP Billing", "Delete")
                .content(content)
                .status("Deleted")
                .patient(admission.getPatient().getRegistrationNumber(), patientDisplayName(admission))
                .ipNumber(admission.getAdmissionNumber())
                .screenName("Patient Billing Advice"));
    }

    private String lineItemSummary(IpBillingLineItem item) {
        return item.getComponent().getName() + " x" + item.getQuantity() + " = " + item.getLineTotal()
                + (item.getDiscountAmount() > 0 ? ", Discount: " + item.getDiscountAmount() : "")
                + (item.getRefundAmount() > 0 ? ", Refund: " + item.getRefundAmount() : "");
    }

    private String patientDisplayName(Admission admission) {
        Patient patient = admission.getPatient();
        return (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim();
    }

    public IpBillingLedgerDto getLedger(Long admissionId) {
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new EntityNotFoundException("Admission not found: " + admissionId));
        List<IpBillingLineItem> items = lineItemRepository.findByAdmissionIdOrderByRequestedOnAsc(admissionId);

        List<WardStayDto> wardStays = computeWardStays(admission);
        double wardBedTotal = wardStays.stream().mapToDouble(WardStayDto::invoicedAmount).sum();

        List<IpBillingLedgerRowDto> rows = new ArrayList<>();
        rows.add(new IpBillingLedgerRowDto(WARD_BED_CHARGES, wardBedTotal, 0, 0, wardBedTotal, List.of()));

        Map<String, List<IpBillingLineItem>> byCategory = new LinkedHashMap<>();
        for (IpBillingLineItem item : items) {
            byCategory.computeIfAbsent(item.getCategory().getName(), k -> new ArrayList<>()).add(item);
        }
        for (Map.Entry<String, List<IpBillingLineItem>> entry : byCategory.entrySet()) {
            rows.add(categoryRow(entry.getKey(), entry.getValue()));
        }

        double netInvoiced = rows.stream().mapToDouble(IpBillingLedgerRowDto::invoiced).sum();
        double netDiscount = rows.stream().mapToDouble(IpBillingLedgerRowDto::discount).sum();
        double netRefund = rows.stream().mapToDouble(IpBillingLedgerRowDto::refund).sum();
        double netTotal = rows.stream().mapToDouble(IpBillingLedgerRowDto::net).sum();

        return new IpBillingLedgerDto(rows, netInvoiced, netDiscount, netRefund, netTotal, wardStays);
    }

    /** IP Consultant Wise Report: net billed amount (invoiced - discount - refund) per consultant, over a date range. */
    public List<IpConsultantWiseReportRowDto> getConsultantWiseReport(LocalDate fromDate, LocalDate toDate, Long consultantId) {
        Instant fromInstant = fromDate != null ? fromDate.atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        Instant toInstant = toDate != null ? toDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        List<IpBillingLineItem> items = lineItemRepository.findForConsultantWiseReport(fromInstant, toInstant, consultantId);

        Map<Long, List<IpBillingLineItem>> byConsultant = new LinkedHashMap<>();
        for (IpBillingLineItem item : items) {
            Long key = item.getConsultant() != null ? item.getConsultant().getId() : 0L;
            byConsultant.computeIfAbsent(key, k -> new ArrayList<>()).add(item);
        }

        return byConsultant.entrySet().stream()
                .map(entry -> {
                    List<IpBillingLineItem> rows = entry.getValue();
                    Consultant consultant = rows.get(0).getConsultant();
                    double invoiced = rows.stream().mapToDouble(IpBillingLineItem::getLineTotal).sum();
                    double discount = rows.stream().mapToDouble(IpBillingLineItem::getDiscountAmount).sum();
                    double refund = rows.stream().mapToDouble(IpBillingLineItem::getRefundAmount).sum();
                    return new IpConsultantWiseReportRowDto(
                            consultant != null ? consultant.getId() : null,
                            consultant != null ? consultant.getName() : "Unassigned",
                            consultant != null && consultant.getSpecialization() != null ? consultant.getSpecialization().getName() : null,
                            invoiced - discount - refund);
                })
                .sorted(Comparator.comparing(IpConsultantWiseReportRowDto::consultantName))
                .toList();
    }

    /** Admission Report (PDF: "Admission Details"): one row per admission with its net invoice total and amount paid so far. */
    public List<AdmissionReportRowDto> getAdmissionReport(LocalDate fromDate, LocalDate toDate, String paymentTypeFilter) {
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.plusDays(1).atStartOfDay() : null;

        return admissionRepository.findForAdmissionReport(fromDateTime, toDateTime).stream()
                .filter(admission -> matchesPaymentTypeFilter(admission, paymentTypeFilter))
                .map(this::toAdmissionReportRow)
                .toList();
    }

    /** Discharge List (PDF): one row per DISCHARGED admission with its full invoiced/paid/refund/discount/balance breakdown. */
    public List<DischargeListRowDto> getDischargeList(LocalDate fromDate, LocalDate toDate, String billingTypeFilter) {
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.plusDays(1).atStartOfDay() : null;

        return admissionRepository.findDischargedForList(fromDateTime, toDateTime).stream()
                .filter(admission -> matchesPaymentTypeFilter(admission, billingTypeFilter))
                .map(this::toDischargeListRow)
                .toList();
    }

    private DischargeListRowDto toDischargeListRow(Admission admission) {
        Patient patient = admission.getPatient();
        BillingBreakdown breakdown = computeBillingBreakdown(admission);
        double paidAmount = admission.getAdvanceAmount();
        return new DischargeListRowDto(
                admission.getId(),
                admission.getAdmissionNumber(),
                patient.getRegistrationNumber(),
                (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim(),
                patient.getGender(),
                admission.getPaymentType() != null ? admission.getPaymentType().name() : null,
                admission.getInsuranceType(),
                admission.getAdmissionDate(),
                admission.getDischargeDate(),
                breakdown.invoiced(),
                paidAmount,
                breakdown.refund(),
                breakdown.discount(),
                breakdown.net() - paidAmount);
    }

    /** Cancelled Admissions (PDF audit screen): one row per CANCELLED admission, filtered by an exact date-time range. */
    public List<CancelledAdmissionRowDto> getCancelledAdmissions(LocalDateTime fromDateTime, LocalDateTime toDateTime) {
        return admissionRepository.findCancelledForList(fromDateTime, toDateTime).stream()
                .map(this::toCancelledAdmissionRow)
                .toList();
    }

    private CancelledAdmissionRowDto toCancelledAdmissionRow(Admission admission) {
        Patient patient = admission.getPatient();
        Room room = admission.getRoom();
        RoomType roomType = admission.getRoomType();
        return new CancelledAdmissionRowDto(
                admission.getId(),
                patient.getRegistrationNumber(),
                (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim(),
                admission.getAdmissionNumber(),
                admission.getDescriptionOfCase(),
                admission.getPaymentType() != null ? admission.getPaymentType().name() : null,
                admission.getPrimaryConsultant(),
                admission.getReferralDoctor(),
                room != null ? room.getRoomType().getName() : (roomType != null ? roomType.getName() : null),
                admission.getCreatedAt(),
                admission.getCreatedBy(),
                admission.getCancelledAt(),
                admission.getCancelledBy(),
                admission.getCancellationReason(),
                computeRefundBreakdown(admission).status());
    }

    /** Cancelled Admission detail (PDF: "View Details" drill-down), including a financial summary if any advance was collected. */
    public CancelledAdmissionDetailDto getCancelledAdmissionDetail(Long admissionId) {
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new EntityNotFoundException("Admission not found: " + admissionId));
        Patient patient = admission.getPatient();
        Room room = admission.getRoom();
        RoomType roomType = admission.getRoomType();
        RefundBreakdown refund = computeRefundBreakdown(admission);
        double admissionCharges = computeNetTotal(admission);
        double advanceAmount = admission.getAdvanceAmount();

        return new CancelledAdmissionDetailDto(
                admission.getId(),
                admission.getAdmissionNumber(),
                patient.getRegistrationNumber(),
                (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim(),
                patient.getGender(),
                patient.getAge(),
                patient.getMobileNumber(),
                patient.getAddress(),
                admission.getAdmissionDate(),
                admission.getCancelledAt(),
                room != null ? room.getRoomType().getName() : (roomType != null ? roomType.getName() : null),
                room != null ? room.getRoomNumber() : null,
                admission.getPrimaryConsultant(),
                admission.getReferralDoctor(),
                admission.getPaymentType() != null ? admission.getPaymentType().name() : null,
                admission.getStatus().name(),
                admission.getCancellationReason(),
                admission.getCancelledBy(),
                admission.getRemarks(),
                admission.getCreatedAt(),
                admission.getCreatedBy(),
                admissionCharges,
                advanceAmount,
                refund.totalRefunded(),
                advanceAmount - admissionCharges,
                refund.status());
    }

    /** Refund status for a cancelled admission, derived from its real IpPayment history (ties into the existing Advance Cancel reversal). */
    private RefundBreakdown computeRefundBreakdown(Admission admission) {
        List<IpPayment> payments = paymentRepository.findByAdmissionIdOrderByPaymentDateDesc(admission.getId());
        double totalInvoiced = payments.stream().mapToDouble(IpPayment::getInvoicedAmount).sum();
        double totalRefunded = payments.stream().mapToDouble(IpPayment::getRefundAmount).sum();
        String status;
        if (totalInvoiced <= 0) {
            status = "Not Applicable";
        } else if (admission.getAdvanceAmount() <= 0) {
            status = "Completed";
        } else {
            status = "Pending";
        }
        return new RefundBreakdown(totalRefunded, status);
    }

    private record RefundBreakdown(double totalRefunded, String status) {
    }

    private boolean matchesPaymentTypeFilter(Admission admission, String filter) {
        if (filter == null || filter.equalsIgnoreCase("ALL")) {
            return true;
        }
        if (filter.equalsIgnoreCase("CASH")) {
            return admission.getPaymentType() == AdmissionPaymentType.CASH;
        }
        if (filter.equalsIgnoreCase("CLAIM")) {
            return admission.getPaymentType() != null && admission.getPaymentType() != AdmissionPaymentType.CASH;
        }
        return true;
    }

    private AdmissionReportRowDto toAdmissionReportRow(Admission admission) {
        Patient patient = admission.getPatient();
        Room room = admission.getRoom();
        return new AdmissionReportRowDto(
                admission.getId(),
                admission.getAdmissionNumber(),
                patient.getRegistrationNumber(),
                (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim(),
                patient.getGender(),
                admission.getPaymentType() != null ? admission.getPaymentType().name() : null,
                admission.getAdmissionDate(),
                admission.getDischargeDate(),
                room != null ? room.getRoomNumber() : null,
                room != null ? room.getRoomType().getName() : (admission.getRoomType() != null ? admission.getRoomType().getName() : null),
                computeNetTotal(admission),
                admission.getAdvanceAmount());
    }

    /** Same net-total math as getLedger(), flattened to a single number for the Admission Report's Invoice Amount column. */
    private double computeNetTotal(Admission admission) {
        return computeBillingBreakdown(admission).net();
    }

    /** Shared invoiced/discount/refund/net computation behind computeNetTotal() and the Discharge List's fuller column breakdown. */
    private BillingBreakdown computeBillingBreakdown(Admission admission) {
        double wardBed = computeWardStays(admission).stream().mapToDouble(WardStayDto::invoicedAmount).sum();
        List<IpBillingLineItem> items = lineItemRepository.findByAdmissionIdOrderByRequestedOnAsc(admission.getId());
        double lineInvoiced = items.stream().mapToDouble(IpBillingLineItem::getLineTotal).sum();
        double discount = items.stream().mapToDouble(IpBillingLineItem::getDiscountAmount).sum();
        double refund = items.stream().mapToDouble(IpBillingLineItem::getRefundAmount).sum();
        double invoiced = wardBed + lineInvoiced;
        return new BillingBreakdown(invoiced, discount, refund, invoiced - discount - refund);
    }

    private record BillingBreakdown(double invoiced, double discount, double refund, double net) {
    }

    /**
     * Ward/Bed Charges, split one row per room the patient actually occupied
     * (AdmissionRoomHistory), so a mid-stay Ward Change prices each room
     * separately instead of billing the whole stay at whatever room the
     * patient currently happens to be in.
     */
    private List<WardStayDto> computeWardStays(Admission admission) {
        List<AdmissionRoomHistory> periods = roomHistoryRepository.findByAdmissionIdOrderByFromDateAsc(admission.getId());
        if (periods.isEmpty()) {
            if (admission.getRoom() == null) {
                return List.of();
            }
            // Defensive fallback only - admit()/admitRegistered() always open a period, and V47 backfilled every pre-existing admission.
            Instant from = toInstant(admission.getAdmissionDate());
            Instant to = admission.getDischargeDate() != null ? toInstant(admission.getDischargeDate()) : Instant.now();
            return List.of(wardStayFor(admission.getRoom(), admission, from, to));
        }
        return periods.stream()
                .map(period -> wardStayFor(
                        period.getRoom(),
                        admission,
                        toInstant(period.getFromDate()),
                        period.getToDate() != null
                                ? toInstant(period.getToDate())
                                : (admission.getDischargeDate() != null ? toInstant(admission.getDischargeDate()) : Instant.now())))
                .toList();
    }

    private WardStayDto wardStayFor(Room room, Admission admission, Instant from, Instant to) {
        RoomType roomType = room.getRoomType();
        double dailyRate = admission.getPaymentType() == AdmissionPaymentType.INSURANCE ? roomType.getRentClaim() : roomType.getRentCash();
        double exactDays = Math.max(Duration.between(from, to).toMinutes() / (24.0 * 60.0), 0);
        return new WardStayDto(room.getRoomNumber(), roomType.getName(), Math.round(exactDays * 10.0) / 10.0, dailyRate * exactDays);
    }

    private Instant toInstant(LocalDateTime dateTime) {
        return dateTime.atZone(ZoneId.systemDefault()).toInstant();
    }

    private IpBillingLedgerRowDto categoryRow(String categoryName, List<IpBillingLineItem> items) {
        double invoiced = items.stream().mapToDouble(IpBillingLineItem::getLineTotal).sum();
        double discount = items.stream().mapToDouble(IpBillingLineItem::getDiscountAmount).sum();
        double refund = items.stream().mapToDouble(IpBillingLineItem::getRefundAmount).sum();
        double net = invoiced - discount - refund;
        List<IpBillingLineItemDto> lineItems = items.stream().map(this::toDto).toList();
        return new IpBillingLedgerRowDto(categoryName, invoiced, discount, refund, net, lineItems);
    }

    private Consultant resolveConsultant(Long consultantId) {
        if (consultantId == null) {
            return null;
        }
        return consultantRepository.findById(consultantId)
                .orElseThrow(() -> new EntityNotFoundException("Consultant not found: " + consultantId));
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private IpPaymentDto toPaymentDto(IpPayment payment) {
        return new IpPaymentDto(
                payment.getId(),
                payment.getAdmission().getId(),
                payment.getPaymentDate(),
                payment.getReceiptNumber(),
                payment.getDescription(),
                payment.getPaymentType(),
                payment.getInvoicedAmount(),
                payment.getRefundAmount(),
                payment.getNetAmount(),
                payment.getCreatedBy());
    }

    private IpBillingLineItemDto toDto(IpBillingLineItem item) {
        Consultant consultant = item.getConsultant();
        return new IpBillingLineItemDto(
                item.getId(),
                item.getAdmission().getId(),
                item.getCategory().getId(),
                item.getCategory().getName(),
                consultant != null ? consultant.getId() : null,
                consultant != null ? consultant.getName() : null,
                item.getComponent().getId(),
                item.getComponent().getName(),
                item.getRemarks(),
                item.getQuantity(),
                item.getUnitAmount(),
                item.getUnits(),
                item.getLineTotal(),
                item.getDiscountAmount(),
                item.getRefundAmount(),
                item.getDiscountReason(),
                item.getRequestedOn(),
                item.getCreatedBy());
    }
}
