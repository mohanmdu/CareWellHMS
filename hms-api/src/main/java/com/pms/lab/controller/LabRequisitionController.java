package com.pms.lab.controller;

import com.pms.lab.dto.LabCategoryTestGroupDto;
import com.pms.lab.dto.LabRequisitionApproveDto;
import com.pms.lab.dto.LabRequisitionCreateDto;
import com.pms.lab.dto.LabRequisitionDto;
import com.pms.lab.dto.LabRequisitionListRowDto;
import com.pms.lab.service.LabRequisitionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lab/requisitions")
public class LabRequisitionController {

    private final LabRequisitionService service;

    public LabRequisitionController(LabRequisitionService service) {
        this.service = service;
    }

    @GetMapping("/test-catalog")
    public List<LabCategoryTestGroupDto> testCatalog() {
        return service.getTestCatalog();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LabRequisitionDto create(@Valid @RequestBody LabRequisitionCreateDto dto) {
        return service.create(dto);
    }

    @GetMapping("/pending")
    public List<LabRequisitionListRowDto> pending() {
        return service.getPendingList();
    }

    @GetMapping("/{id}")
    public LabRequisitionDto get(@PathVariable Long id) {
        return service.getById(id);
    }

    @PatchMapping("/{id}/approve")
    public LabRequisitionDto approve(@PathVariable Long id, @Valid @RequestBody LabRequisitionApproveDto dto) {
        return service.approve(id, dto);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        service.cancel(id);
        return ResponseEntity.noContent().build();
    }
}
