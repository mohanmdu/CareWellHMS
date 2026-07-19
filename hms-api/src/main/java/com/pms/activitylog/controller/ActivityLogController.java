package com.pms.activitylog.controller;

import com.pms.activitylog.dto.ActivityLogDto;
import com.pms.activitylog.service.ActivityLogService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** IP/OP Billing Activity Log ("IP/OP Tracking Report") REST endpoints. */
@RestController
@RequestMapping("/api/activity-log")
public class ActivityLogController {

    private final ActivityLogService service;

    public ActivityLogController(ActivityLogService service) {
        this.service = service;
    }

    @GetMapping
    public List<ActivityLogDto> search(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String patientUhid,
            @RequestParam(required = false) String patientName,
            @RequestParam(required = false) String opNumber,
            @RequestParam(required = false) String ipNumber,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String operation,
            @RequestParam(required = false) String performedBy,
            @RequestParam(required = false) String status) {
        return service.search(fromDate, toDate, patientUhid, patientName, opNumber, ipNumber, module, operation, performedBy, status);
    }

    @GetMapping("/{id}")
    public ActivityLogDto get(@PathVariable Long id) {
        return service.findById(id);
    }
}
