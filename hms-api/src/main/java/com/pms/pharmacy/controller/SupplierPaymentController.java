package com.pms.pharmacy.controller;

import com.pms.pharmacy.dto.InvoiceOutstandingDto;
import com.pms.pharmacy.dto.SupplierPaymentHistoryDto;
import com.pms.pharmacy.dto.SupplierPaymentRequest;
import com.pms.pharmacy.dto.VendorOutstandingDto;
import com.pms.pharmacy.service.SupplierPaymentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pharmacy/supplier-payments")
public class SupplierPaymentController {

    private final SupplierPaymentService service;

    public SupplierPaymentController(SupplierPaymentService service) {
        this.service = service;
    }

    @GetMapping("/vendors")
    public List<VendorOutstandingDto> vendorOutstanding() {
        return service.vendorOutstanding();
    }

    @GetMapping("/vendors/{supplierId}/invoices")
    public List<InvoiceOutstandingDto> invoicesForVendor(@PathVariable Long supplierId) {
        return service.invoicesForVendor(supplierId);
    }

    @GetMapping("/invoices/{grnId}/history")
    public List<SupplierPaymentHistoryDto> paymentHistory(@PathVariable Long grnId) {
        return service.paymentHistory(grnId);
    }

    @PatchMapping("/vendors/{supplierId}/pay-all")
    public void payAll(@PathVariable Long supplierId, @Valid @RequestBody SupplierPaymentRequest request) {
        service.payAll(supplierId, request);
    }

    @PatchMapping("/pay-selected")
    public void paySelected(@RequestBody PaySelectedRequest request) {
        service.paySelected(request.grnIds(), request.payment());
    }

    @PatchMapping("/invoices/{grnId}/pay")
    public void payInvoice(@PathVariable Long grnId, @Valid @RequestBody SupplierPaymentRequest request) {
        service.payInvoice(grnId, request);
    }

    public record PaySelectedRequest(List<Long> grnIds, SupplierPaymentRequest payment) {
    }
}
