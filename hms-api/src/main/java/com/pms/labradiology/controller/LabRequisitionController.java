package com.pms.labradiology.controller;

import com.pms.labradiology.dto.LabRequisitionDto;
import com.pms.labradiology.service.LabRequisitionService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * Collapses the legacy requisitionInput/requisitionInputforIP/requisitionInputOP
 * and labEntrySaveAction (byPass=1/2) into explicit REST operations
 * (migration doc §4.4). CT/Xray use this same controller - they are a
 * LabCategory-billed variant, not separate code.
 */
@RestController
@RequestMapping("/api/lab/requisitions")
public class LabRequisitionController {

    private final LabRequisitionService service;

    public LabRequisitionController(LabRequisitionService service) {
        this.service = service;
    }

    @GetMapping
    public List<LabRequisitionDto> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public LabRequisitionDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LabRequisitionDto create(@Valid @RequestBody LabRequisitionDto dto) {
        return service.create(dto);
    }

    @PatchMapping("/{id}/items/{itemId}/collect-specimen")
    public LabRequisitionDto collectSpecimen(@PathVariable Long id, @PathVariable Long itemId) {
        return service.collectSpecimen(id, itemId);
    }

    @PatchMapping("/{id}/items/{itemId}/enter-result")
    public LabRequisitionDto enterResult(@PathVariable Long id, @PathVariable Long itemId, @RequestBody Map<String, String> body) {
        return service.enterResult(id, itemId, body.get("resultValue"), body.get("normalRange"));
    }

    @PatchMapping("/{id}/items/{itemId}/approve")
    public LabRequisitionDto approve(@PathVariable Long id, @PathVariable Long itemId) {
        return service.approve(id, itemId);
    }

    @PatchMapping("/{id}/cancel")
    public LabRequisitionDto cancel(@PathVariable Long id) {
        return service.cancel(id);
    }
}
