package com.pms.ipadmission.controller;

import com.pms.ipadmission.dto.AdmissionDto;
import com.pms.ipadmission.service.AdmissionService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @GetMapping("/{id}")
    public AdmissionDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdmissionDto admit(@Valid @RequestBody AdmissionDto dto) {
        return service.admit(dto);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AdmissionDto register(@Valid @RequestBody AdmissionDto dto) {
        return service.register(dto);
    }

    @PostMapping("/{id}/photo")
    public AdmissionDto uploadPhoto(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return service.uploadPhoto(id, file);
    }

    @PatchMapping("/{id}/admit")
    public AdmissionDto admitRegistered(@PathVariable Long id, @Valid @RequestBody AdmissionDto dto) {
        return service.admitRegistered(id, dto);
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

    @PatchMapping("/{id}/change-room")
    public AdmissionDto changeRoom(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        return service.changeRoom(id, body.get("roomId"));
    }
}
