package com.pms.lab.controller;

import com.pms.lab.dto.LabApprovedListRowDto;
import com.pms.lab.dto.LabTestEntryDto;
import com.pms.lab.dto.LabTestEntryListRowDto;
import com.pms.lab.dto.LabTestEntrySaveDto;
import com.pms.lab.entity.LabTestEntryStatus;
import com.pms.lab.service.LabTestEntryService;
import jakarta.validation.Valid;
import java.util.Arrays;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lab/test-entries")
public class LabTestEntryController {

    private final LabTestEntryService service;

    public LabTestEntryController(LabTestEntryService service) {
        this.service = service;
    }

    @GetMapping
    public List<LabTestEntryListRowDto> queue(@RequestParam String statuses) {
        List<LabTestEntryStatus> parsed = Arrays.stream(statuses.split(","))
                .map(String::trim)
                .map(LabTestEntryStatus::valueOf)
                .toList();
        return service.getQueue(parsed);
    }

    @GetMapping("/approved")
    public List<LabApprovedListRowDto> approved() {
        return service.getApprovedList();
    }

    @GetMapping("/{id}")
    public LabTestEntryDto get(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public LabTestEntryDto save(@PathVariable Long id, @Valid @RequestBody LabTestEntrySaveDto dto) {
        return service.save(id, dto);
    }

    @PutMapping("/{id}/draft")
    public LabTestEntryDto saveDraft(@PathVariable Long id, @Valid @RequestBody LabTestEntrySaveDto dto) {
        return service.saveDraft(id, dto);
    }

    @PatchMapping("/{id}/approve")
    public LabTestEntryDto approve(@PathVariable Long id, @Valid @RequestBody LabTestEntrySaveDto dto) {
        return service.approve(id, dto);
    }
}
