package com.pms.pharmacy.service;

import com.pms.common.EntityNotFoundException;
import com.pms.pharmacy.dto.InvoiceOutstandingDto;
import com.pms.pharmacy.dto.SupplierPaymentHistoryDto;
import com.pms.pharmacy.dto.SupplierPaymentRequest;
import com.pms.pharmacy.dto.VendorOutstandingDto;
import com.pms.pharmacy.entity.Grn;
import com.pms.pharmacy.entity.GrnStatus;
import com.pms.pharmacy.entity.Supplier;
import com.pms.pharmacy.entity.SupplierPaymentRecord;
import com.pms.pharmacy.repository.GrnRepository;
import com.pms.pharmacy.repository.SupplierPaymentRecordRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Track-only supplier payment ledger (no real payment gateway, matching this
 * app's posture everywhere else). Paid/balance amounts are always computed
 * live from SupplierPaymentRecord rows against APPROVED Grns - never stored
 * redundantly on Grn/Supplier.
 */
@Service
@Transactional(readOnly = true)
public class SupplierPaymentService {

    private final GrnRepository grnRepository;
    private final SupplierPaymentRecordRepository paymentRepository;

    public SupplierPaymentService(GrnRepository grnRepository, SupplierPaymentRecordRepository paymentRepository) {
        this.grnRepository = grnRepository;
        this.paymentRepository = paymentRepository;
    }

    public List<VendorOutstandingDto> vendorOutstanding() {
        List<Grn> approved = grnRepository.findByStatusOrderByGrnDateAsc(GrnStatus.APPROVED);
        Map<Supplier, List<Grn>> bySupplier = new LinkedHashMap<>();
        for (Grn grn : approved) {
            bySupplier.computeIfAbsent(grn.getSupplier(), s -> new ArrayList<>()).add(grn);
        }
        List<VendorOutstandingDto> result = new ArrayList<>();
        for (Map.Entry<Supplier, List<Grn>> entry : bySupplier.entrySet()) {
            double total = entry.getValue().stream().mapToDouble(Grn::getInvoiceAmount).sum();
            double paid = entry.getValue().stream().mapToDouble(grn -> paymentRepository.sumByGrnId(grn.getId())).sum();
            double balance = total - paid;
            if (balance > 0) {
                result.add(new VendorOutstandingDto(entry.getKey().getId(), entry.getKey().getName(), total, paid, balance));
            }
        }
        return result;
    }

    public List<InvoiceOutstandingDto> invoicesForVendor(Long supplierId) {
        return grnRepository.findBySupplierIdAndStatusOrderByGrnDateAsc(supplierId, GrnStatus.APPROVED).stream()
                .map(this::toInvoiceDto)
                .toList();
    }

    public List<SupplierPaymentHistoryDto> paymentHistory(Long grnId) {
        return paymentRepository.findByGrnIdOrderByPaidAtDesc(grnId).stream()
                .map(p -> new SupplierPaymentHistoryDto(p.getId(), p.getPaidBy(), p.getPaidAt(), p.getPayMode(), p.getTransactionId(), p.getRemarks(), p.getAmount()))
                .toList();
    }

    @Transactional
    public void payAll(Long supplierId, SupplierPaymentRequest request) {
        List<Grn> invoices = grnRepository.findBySupplierIdAndStatusOrderByGrnDateAsc(supplierId, GrnStatus.APPROVED);
        distributeFifo(invoices, request);
    }

    @Transactional
    public void paySelected(List<Long> grnIds, SupplierPaymentRequest request) {
        List<Grn> invoices = grnRepository.findAllById(grnIds).stream()
                .sorted(Comparator.comparing(Grn::getGrnDate))
                .toList();
        distributeFifo(invoices, request);
    }

    @Transactional
    public void payInvoice(Long grnId, SupplierPaymentRequest request) {
        Grn grn = grnRepository.findById(grnId).orElseThrow(() -> new EntityNotFoundException("GRN not found: " + grnId));
        double due = grn.getInvoiceAmount() - paymentRepository.sumByGrnId(grnId);
        if (request.amount() <= 0 || request.amount() > due) {
            throw new IllegalArgumentException("Amount must be greater than zero and cannot exceed the outstanding balance");
        }
        savePayment(grn, request.amount(), request);
    }

    private void distributeFifo(List<Grn> invoices, SupplierPaymentRequest request) {
        double remaining = request.amount();
        if (remaining <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }
        for (Grn grn : invoices) {
            if (remaining <= 0) {
                break;
            }
            double due = grn.getInvoiceAmount() - paymentRepository.sumByGrnId(grn.getId());
            if (due <= 0) {
                continue;
            }
            double pay = Math.min(remaining, due);
            savePayment(grn, pay, request);
            remaining -= pay;
        }
    }

    private void savePayment(Grn grn, double amount, SupplierPaymentRequest request) {
        SupplierPaymentRecord record = new SupplierPaymentRecord();
        record.setGrn(grn);
        record.setAmount(amount);
        record.setPayMode(request.payMode());
        record.setTransactionId(request.transactionId());
        record.setRemarks(request.remarks());
        record.setPaidBy(currentUsername());
        record.setPaidAt(Instant.now());
        paymentRepository.save(record);
    }

    private InvoiceOutstandingDto toInvoiceDto(Grn grn) {
        double paid = paymentRepository.sumByGrnId(grn.getId());
        return new InvoiceOutstandingDto(
                grn.getId(),
                grn.getSupplier().getId(),
                grn.getSupplier().getName(),
                grn.getInvoiceNo(),
                grn.getInvoiceDate(),
                grn.getGrnDate(),
                grn.getInvoiceAmount(),
                paid,
                grn.getInvoiceAmount() - paid);
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }
}
