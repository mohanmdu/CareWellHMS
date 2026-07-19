package com.pms.ipbilling.controller;

import com.pms.ipbilling.dto.AdmissionReportRowDto;
import com.pms.ipbilling.dto.IpBillingLedgerDto;
import com.pms.ipbilling.dto.IpBillingLineItemDto;
import com.pms.ipbilling.dto.IpConsultantWiseReportRowDto;
import com.pms.ipbilling.dto.IpPaymentDto;
import com.pms.ipbilling.service.IpBillingService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/** Patient Billing Advice / BILLING ledger (PDF p.11-12) - a per-admission billing workspace. */
@RestController
@RequestMapping("/api/ipbilling")
public class IpBillingController {

    private final IpBillingService service;

    public IpBillingController(IpBillingService service) {
        this.service = service;
    }

    @GetMapping("/admissions/{admissionId}/line-items")
    public List<IpBillingLineItemDto> listLineItems(@PathVariable Long admissionId) {
        return service.listLineItems(admissionId);
    }

    @PostMapping("/admissions/{admissionId}/line-items")
    @ResponseStatus(HttpStatus.CREATED)
    public IpBillingLineItemDto addLineItem(@PathVariable Long admissionId, @Valid @RequestBody IpBillingLineItemDto dto) {
        return service.addLineItem(admissionId, dto);
    }

    @PutMapping("/line-items/{id}")
    public IpBillingLineItemDto updateLineItem(@PathVariable Long id, @RequestBody IpBillingLineItemDto dto) {
        return service.updateLineItem(id, dto);
    }

    @DeleteMapping("/line-items/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLineItem(@PathVariable Long id) {
        service.deleteLineItem(id);
    }

    @GetMapping("/admissions/{admissionId}/ledger")
    public IpBillingLedgerDto getLedger(@PathVariable Long admissionId) {
        return service.getLedger(admissionId);
    }

    @GetMapping("/admissions/{admissionId}/payments")
    public List<IpPaymentDto> listPayments(@PathVariable Long admissionId) {
        return service.listPayments(admissionId);
    }

    @GetMapping("/reports/consultant-wise")
    public List<IpConsultantWiseReportRowDto> consultantWiseReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long consultantId) {
        return service.getConsultantWiseReport(fromDate, toDate, consultantId);
    }

    @GetMapping("/reports/admission")
    public List<AdmissionReportRowDto> admissionReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String paymentType) {
        return service.getAdmissionReport(fromDate, toDate, paymentType);
    }
}
