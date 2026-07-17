package com.pms.masters.controller;

import com.pms.masters.dto.IpBillingActivityLogDto;
import com.pms.masters.service.IpBillingActivityLogService;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/masters/ip-billing-components/activity-log")
public class IpBillingActivityLogController {

    private final IpBillingActivityLogService service;

    public IpBillingActivityLogController(IpBillingActivityLogService service) {
        this.service = service;
    }

    @GetMapping
    public List<IpBillingActivityLogDto> search(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return service.search(toInstant(fromDate), toInstantExclusive(toDate));
    }

    private static Instant toInstant(LocalDate date) {
        return date != null ? date.atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
    }

    private static Instant toInstantExclusive(LocalDate date) {
        return date != null ? date.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
    }
}
