package com.pms.registration.controller;

import com.pms.registration.dto.PatientDto;
import com.pms.registration.service.PatientService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * REST equivalent of the legacy patientRegistration Struts action
 * (migration doc §4.1).
 */
@RestController
@RequestMapping("/api/registration/patients")
public class PatientController {

    private final PatientService service;

    public PatientController(PatientService service) {
        this.service = service;
    }

    @GetMapping
    public List<PatientDto> search(@RequestParam(required = false) String query) {
        return service.search(query);
    }

    @GetMapping("/{id}")
    public PatientDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PatientDto register(@Valid @RequestBody PatientDto dto) {
        return service.register(dto);
    }
}
