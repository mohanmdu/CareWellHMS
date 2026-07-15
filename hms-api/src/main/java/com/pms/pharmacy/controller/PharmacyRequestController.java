package com.pms.pharmacy.controller;

import com.pms.pharmacy.dto.PharmacyRequestDto;
import com.pms.pharmacy.dto.PharmacyRequestListEntryDto;
import com.pms.pharmacy.service.PharmacyRequestService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pharmacy/requests")
public class PharmacyRequestController {

    private final PharmacyRequestService service;

    public PharmacyRequestController(PharmacyRequestService service) {
        this.service = service;
    }

    @GetMapping
    public List<PharmacyRequestListEntryDto> list(@RequestParam(required = false) Long patientId) {
        return patientId != null ? service.findPendingForPatient(patientId) : service.findPending();
    }

    @GetMapping("/{id}")
    public PharmacyRequestDto get(@PathVariable Long id) {
        return service.findById(id);
    }
}
