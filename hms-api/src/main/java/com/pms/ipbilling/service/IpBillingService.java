package com.pms.ipbilling.service;

import com.pms.common.EntityNotFoundException;
import com.pms.ipadmission.entity.Admission;
import com.pms.ipadmission.entity.AdmissionPaymentType;
import com.pms.ipadmission.entity.RoomType;
import com.pms.ipadmission.repository.AdmissionRepository;
import com.pms.ipbilling.dto.IpBillingLedgerDto;
import com.pms.ipbilling.dto.IpBillingLedgerRowDto;
import com.pms.ipbilling.dto.IpBillingLineItemDto;
import com.pms.ipbilling.dto.IpPaymentDto;
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
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
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
    private final IpBillingCategoryRepository categoryRepository;
    private final IpBillingComponentRepository componentRepository;
    private final ConsultantRepository consultantRepository;

    public IpBillingService(
            IpBillingLineItemRepository lineItemRepository,
            IpPaymentRepository paymentRepository,
            AdmissionRepository admissionRepository,
            IpBillingCategoryRepository categoryRepository,
            IpBillingComponentRepository componentRepository,
            ConsultantRepository consultantRepository) {
        this.lineItemRepository = lineItemRepository;
        this.paymentRepository = paymentRepository;
        this.admissionRepository = admissionRepository;
        this.categoryRepository = categoryRepository;
        this.componentRepository = componentRepository;
        this.consultantRepository = consultantRepository;
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

        return toDto(lineItemRepository.save(item));
    }

    @Transactional
    public IpBillingLineItemDto updateLineItem(Long id, IpBillingLineItemDto dto) {
        IpBillingLineItem item = lineItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Billing line item not found: " + id));
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
        return toDto(lineItemRepository.save(item));
    }

    @Transactional
    public void deleteLineItem(Long id) {
        if (!lineItemRepository.existsById(id)) {
            throw new EntityNotFoundException("Billing line item not found: " + id);
        }
        lineItemRepository.deleteById(id);
    }

    public IpBillingLedgerDto getLedger(Long admissionId) {
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new EntityNotFoundException("Admission not found: " + admissionId));
        List<IpBillingLineItem> items = lineItemRepository.findByAdmissionIdOrderByRequestedOnAsc(admissionId);

        List<IpBillingLedgerRowDto> rows = new ArrayList<>();
        rows.add(wardBedChargesRow(admission));

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

        return new IpBillingLedgerDto(rows, netInvoiced, netDiscount, netRefund, netTotal);
    }

    private IpBillingLedgerRowDto wardBedChargesRow(Admission admission) {
        double invoiced = 0;
        if (admission.getRoom() != null) {
            RoomType roomType = admission.getRoom().getRoomType();
            double dailyRate = admission.getPaymentType() == AdmissionPaymentType.INSURANCE
                    ? roomType.getRentClaim()
                    : roomType.getRentCash();
            invoiced = dailyRate * stayDays(admission);
        }
        return new IpBillingLedgerRowDto(WARD_BED_CHARGES, invoiced, 0, 0, invoiced, List.of());
    }

    private long stayDays(Admission admission) {
        Instant from = admission.getAdmissionDate().atZone(java.time.ZoneId.systemDefault()).toInstant();
        Instant to = admission.getDischargeDate() != null
                ? admission.getDischargeDate().atZone(java.time.ZoneId.systemDefault()).toInstant()
                : Instant.now();
        long days = ChronoUnit.DAYS.between(from, to);
        return Math.max(days, 1);
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
