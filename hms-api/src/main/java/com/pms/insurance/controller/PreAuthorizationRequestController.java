package com.pms.insurance.controller;

import com.pms.insurance.dto.PreAuthorizationRequestCreateDto;
import com.pms.insurance.dto.PreAuthorizationRequestDto;
import com.pms.insurance.dto.PreAuthorizationRequestRaiseDto;
import com.pms.insurance.service.PreAuthorizationRequestService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/insurance/pre-authorization-requests")
public class PreAuthorizationRequestController {

    private final PreAuthorizationRequestService service;

    public PreAuthorizationRequestController(PreAuthorizationRequestService service) {
        this.service = service;
    }

    @GetMapping
    public List<PreAuthorizationRequestDto> list() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PreAuthorizationRequestDto create(@Valid @RequestBody PreAuthorizationRequestCreateDto dto) {
        return service.create(dto);
    }

    @PatchMapping("/{id}/raise")
    public PreAuthorizationRequestDto raise(@PathVariable Long id, @Valid @RequestBody PreAuthorizationRequestRaiseDto dto) {
        return service.raise(id, dto);
    }

    @PatchMapping("/{id}/approve")
    public PreAuthorizationRequestDto approve(@PathVariable Long id, @RequestBody Map<String, Double> body) {
        return service.approve(id, body.getOrDefault("approvedAmount", 0.0));
    }

    @PatchMapping("/{id}/reject")
    public PreAuthorizationRequestDto reject(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.reject(id, body.get("reason"));
    }

    @PatchMapping("/{id}/cancel")
    public PreAuthorizationRequestDto cancel(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.cancel(id, body.get("reason"));
    }
}
