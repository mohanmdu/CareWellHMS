package com.pms.ipadmission.controller;

import com.pms.ipadmission.dto.AdmissionDto;
import com.pms.ipadmission.service.AdmissionService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * REST equivalent of the legacy IPAction admission/advance/discharge family
 * (migration doc §4.2).
 */
@RestController
@RequestMapping("/api/ip/admissions")
public class AdmissionController {

    private final AdmissionService service;

    public AdmissionController(AdmissionService service) {
        this.service = service;
    }

    @GetMapping
    public List<AdmissionDto> list() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdmissionDto admit(@Valid @RequestBody AdmissionDto dto) {
        return service.admit(dto);
    }

    @PatchMapping("/{id}/advance-payment")
    public AdmissionDto addAdvancePayment(@PathVariable Long id, @RequestBody Map<String, Double> body) {
        return service.addAdvancePayment(id, body.getOrDefault("amount", 0.0));
    }

    @PatchMapping("/{id}/discharge")
    public AdmissionDto discharge(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        double totalBilled = ((Number) body.getOrDefault("totalBilled", 0)).doubleValue();
        String dischargeSummary = (String) body.get("dischargeSummary");
        return service.discharge(id, totalBilled, dischargeSummary);
    }
}
