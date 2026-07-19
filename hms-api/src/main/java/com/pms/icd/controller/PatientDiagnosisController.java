package com.pms.icd.controller;

import com.pms.icd.dto.PatientDiagnosisDto;
import com.pms.icd.service.PatientDiagnosisService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/icd")
public class PatientDiagnosisController {

    private final PatientDiagnosisService service;

    public PatientDiagnosisController(PatientDiagnosisService service) {
        this.service = service;
    }

    @GetMapping("/patients/{patientId}/diagnoses")
    public List<PatientDiagnosisDto> findByPatient(@PathVariable Long patientId) {
        return service.findByPatient(patientId);
    }

    @PostMapping("/patients/{patientId}/diagnoses")
    @ResponseStatus(HttpStatus.CREATED)
    public PatientDiagnosisDto create(@PathVariable Long patientId, @Valid @RequestBody PatientDiagnosisDto dto) {
        return service.create(patientId, dto);
    }

    @PutMapping("/diagnoses/{id}")
    public PatientDiagnosisDto update(@PathVariable Long id, @Valid @RequestBody PatientDiagnosisDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/diagnoses/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
