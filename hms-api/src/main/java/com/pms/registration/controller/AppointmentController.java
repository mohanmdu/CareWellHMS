package com.pms.registration.controller;

import com.pms.registration.dto.AppointmentAuditLogDto;
import com.pms.registration.dto.AppointmentDto;
import com.pms.registration.dto.AppointmentSlotDto;
import com.pms.registration.dto.BillAppointmentRequest;
import com.pms.registration.dto.CancelAppointmentRequest;
import com.pms.registration.dto.CollectionReportEntryDto;
import com.pms.registration.dto.DailyAvailabilityDto;
import com.pms.registration.entity.AppointmentStatus;
import com.pms.registration.entity.PaymentMode;
import com.pms.registration.service.AppointmentAvailabilityService;
import com.pms.registration.service.AppointmentService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * REST equivalent of the legacy appointment booking/confirm/cancel family
 * (migration doc §4.1) - collapses ~10 near-duplicate legacy cancel methods
 * into one endpoint with a required reason, and generates bookable slots
 * from ConsultantTiming instead of accepting free-text date/time.
 */
@RestController
@RequestMapping("/api/registration/appointments")
public class AppointmentController {

    private final AppointmentService service;
    private final AppointmentAvailabilityService availabilityService;

    public AppointmentController(AppointmentService service, AppointmentAvailabilityService availabilityService) {
        this.service = service;
        this.availabilityService = availabilityService;
    }

    @GetMapping
    public List<AppointmentDto> list(
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long patientId) {
        if (status == null && fromDate == null && toDate == null && departmentId == null && patientId == null) {
            return service.findAll();
        }
        return service.search(status, fromDate, toDate, departmentId, patientId);
    }

    @GetMapping("/{id}")
    public AppointmentDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping("/availability-summary")
    public List<DailyAvailabilityDto> availabilitySummary(
            @RequestParam Long consultantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return availabilityService.summary(consultantId, fromDate, toDate);
    }

    @GetMapping("/slots")
    public List<AppointmentSlotDto> slots(
            @RequestParam Long consultantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return availabilityService.slots(consultantId, date);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentDto book(@Valid @RequestBody AppointmentDto dto) {
        return service.book(dto);
    }

    @PatchMapping("/{id}/confirm")
    public AppointmentDto confirm(@PathVariable Long id) {
        return service.confirm(id);
    }

    @PatchMapping("/{id}/cancel")
    public AppointmentDto cancel(@PathVariable Long id, @Valid @RequestBody CancelAppointmentRequest request) {
        return service.cancel(id, request.reason(), request.cancelledBy());
    }

    @PatchMapping("/{id}/bill")
    public AppointmentDto bill(@PathVariable Long id, @Valid @RequestBody BillAppointmentRequest request) {
        return service.bill(id, request);
    }

    @GetMapping("/next-invoice-number")
    public long nextInvoiceNumber() {
        return service.peekNextInvoiceNumber();
    }

    @GetMapping("/collection-report")
    public List<CollectionReportEntryDto> collectionReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long consultantId,
            @RequestParam(required = false) PaymentMode paymentMode) {
        return service.collectionReport(fromDate, toDate, consultantId, paymentMode);
    }

    @GetMapping("/audit-logs")
    public List<AppointmentAuditLogDto> auditLogs() {
        return service.auditLogs();
    }
}
