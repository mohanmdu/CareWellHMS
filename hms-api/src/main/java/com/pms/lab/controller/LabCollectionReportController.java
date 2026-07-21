package com.pms.lab.controller;

import com.pms.lab.dto.LabCancelledReportRowDto;
import com.pms.lab.dto.LabCollectionReportDto;
import com.pms.lab.entity.LabPaymentMode;
import com.pms.lab.service.LabCollectionReportService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lab/reports/collection")
public class LabCollectionReportController {

    private final LabCollectionReportService service;

    public LabCollectionReportController(LabCollectionReportService service) {
        this.service = service;
    }

    @GetMapping("/summary")
    public LabCollectionReportDto summary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.summary(from, to);
    }

    @GetMapping("/lab-detail")
    public LabCollectionReportDto labDetail(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long consultantId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) LabPaymentMode paymentMode) {
        return service.labDetail(from, to, consultantId, categoryId, paymentMode);
    }

    @GetMapping("/investigation-detail")
    public LabCollectionReportDto investigationDetail(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long consultantId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) LabPaymentMode paymentMode) {
        return service.investigationDetail(from, to, consultantId, categoryId, paymentMode);
    }

    @GetMapping("/cancelled")
    public List<LabCancelledReportRowDto> cancelled() {
        return service.cancelledReport();
    }
}
