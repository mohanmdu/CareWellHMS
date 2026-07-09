package com.pms.insurance.controller;

import com.pms.insurance.dto.InsuranceClaimDto;
import com.pms.insurance.service.InsuranceClaimService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/insurance/claims")
public class InsuranceClaimController {

    private final InsuranceClaimService service;

    public InsuranceClaimController(InsuranceClaimService service) {
        this.service = service;
    }

    @GetMapping
    public List<InsuranceClaimDto> list() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InsuranceClaimDto create(@Valid @RequestBody InsuranceClaimDto dto) {
        return service.create(dto);
    }

    @PatchMapping("/{id}/approve")
    public InsuranceClaimDto approve(@PathVariable Long id, @RequestBody Map<String, Double> body) {
        return service.approve(id, body.getOrDefault("approvedAmount", 0.0));
    }

    @PatchMapping("/{id}/reject")
    public InsuranceClaimDto reject(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.reject(id, body.get("reason"));
    }

    @PatchMapping("/{id}/cancel")
    public InsuranceClaimDto cancel(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.cancel(id, body.get("reason"));
    }
}
