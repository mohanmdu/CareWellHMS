package com.pms.icd.controller;

import com.pms.icd.dto.PatientVisitSummaryDto;
import com.pms.icd.service.PatientVisitSummaryService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/icd/patients")
public class PatientVisitSummaryController {

    private final PatientVisitSummaryService service;

    public PatientVisitSummaryController(PatientVisitSummaryService service) {
        this.service = service;
    }

    @GetMapping("/search")
    public List<PatientVisitSummaryDto> search(@RequestParam(required = false) String query) {
        return service.search(query);
    }
}
