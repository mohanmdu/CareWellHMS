package com.pms.dischargesummary.controller;

import com.pms.dischargesummary.dto.DischargeSummaryDto;
import com.pms.dischargesummary.dto.DischargeSummaryListRowDto;
import com.pms.dischargesummary.service.DischargeSummaryService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/discharge-summary")
public class DischargeSummaryController {

    private final DischargeSummaryService service;

    public DischargeSummaryController(DischargeSummaryService service) {
        this.service = service;
    }

    @GetMapping("/list")
    public List<DischargeSummaryListRowDto> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String billingType) {
        return service.getList(fromDate, toDate, billingType);
    }

    @GetMapping("/admission/{admissionId}")
    public DischargeSummaryDto getByAdmission(@PathVariable Long admissionId) {
        return service.getByAdmissionId(admissionId);
    }

    @PutMapping("/admission/{admissionId}")
    public DischargeSummaryDto save(@PathVariable Long admissionId, @Valid @RequestBody DischargeSummaryDto dto) {
        return service.save(admissionId, dto);
    }
}
