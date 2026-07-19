package com.pms.icd.controller;

import com.pms.icd.dto.IcdCodeDto;
import com.pms.icd.dto.IcdCodeImportResultDto;
import com.pms.icd.entity.IcdVersion;
import com.pms.icd.service.IcdCodeService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/icd/codes")
public class IcdCodeController {

    private final IcdCodeService service;

    public IcdCodeController(IcdCodeService service) {
        this.service = service;
    }

    @GetMapping
    public List<IcdCodeDto> list() {
        return service.findActive();
    }

    @GetMapping("/inactive")
    public List<IcdCodeDto> inactive() {
        return service.findInactive();
    }

    @GetMapping("/{id}")
    public IcdCodeDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping("/search")
    public List<IcdCodeDto> search(@RequestParam("q") String query, @RequestParam(required = false) IcdVersion version) {
        return service.search(query, version);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IcdCodeDto create(@Valid @RequestBody IcdCodeDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public IcdCodeDto update(@PathVariable Long id, @Valid @RequestBody IcdCodeDto dto) {
        return service.update(id, dto);
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<Void> restore(@PathVariable Long id) {
        service.restore(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import")
    public IcdCodeImportResultDto importCsv(@RequestParam("file") MultipartFile file) {
        return service.importCsv(file);
    }
}
