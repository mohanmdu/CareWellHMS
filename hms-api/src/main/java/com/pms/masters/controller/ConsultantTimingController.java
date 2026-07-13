package com.pms.masters.controller;

import com.pms.masters.dto.ConsultantAvailabilityDto;
import com.pms.masters.service.ConsultantTimingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/masters/consultants/{consultantId}/timings")
public class ConsultantTimingController {

    private final ConsultantTimingService service;

    public ConsultantTimingController(ConsultantTimingService service) {
        this.service = service;
    }

    @GetMapping
    public ConsultantAvailabilityDto get(@PathVariable Long consultantId) {
        return service.findByConsultant(consultantId);
    }

    @PutMapping
    public ConsultantAvailabilityDto replace(
            @PathVariable Long consultantId, @Valid @RequestBody ConsultantAvailabilityDto availability) {
        return service.replace(consultantId, availability);
    }
}
