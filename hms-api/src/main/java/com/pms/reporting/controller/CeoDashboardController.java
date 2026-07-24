package com.pms.reporting.controller;

import com.pms.reporting.dto.CeoIpRevenueDto;
import com.pms.reporting.dto.CeoIpSummaryDto;
import com.pms.reporting.dto.CeoOpRevenueDto;
import com.pms.reporting.dto.CeoOpSummaryDto;
import com.pms.reporting.service.CeoIpRevenueService;
import com.pms.reporting.service.CeoIpSummaryService;
import com.pms.reporting.service.CeoOpRevenueService;
import com.pms.reporting.service.CeoOpSummaryService;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * CEO/MD Dashboard - 4 independent endpoints (one per quadrant) rather than
 * one combined payload, so a slow/broken query in one quadrant never blocks
 * the others from rendering, and so each quadrant can be refreshed
 * independently later. Bed occupancy in ip-summary is a live snapshot and
 * ignores fromDate/toDate; the other 3 are date-ranged.
 */
@RestController
@RequestMapping("/api/reports/ceo-dashboard")
public class CeoDashboardController {

    private final CeoIpSummaryService ipSummaryService;
    private final CeoOpSummaryService opSummaryService;
    private final CeoIpRevenueService ipRevenueService;
    private final CeoOpRevenueService opRevenueService;

    public CeoDashboardController(
            CeoIpSummaryService ipSummaryService,
            CeoOpSummaryService opSummaryService,
            CeoIpRevenueService ipRevenueService,
            CeoOpRevenueService opRevenueService) {
        this.ipSummaryService = ipSummaryService;
        this.opSummaryService = opSummaryService;
        this.ipRevenueService = ipRevenueService;
        this.opRevenueService = opRevenueService;
    }

    @GetMapping("/ip-summary")
    public CeoIpSummaryDto ipSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ipSummaryService.summary(fromDate, toDate);
    }

    @GetMapping("/op-summary")
    public CeoOpSummaryDto opSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return opSummaryService.summary(fromDate, toDate);
    }

    @GetMapping("/ip-revenue")
    public CeoIpRevenueDto ipRevenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ipRevenueService.revenue(fromDate, toDate);
    }

    @GetMapping("/op-revenue")
    public CeoOpRevenueDto opRevenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return opRevenueService.revenue(fromDate, toDate);
    }
}
