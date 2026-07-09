package com.pms.pharmacy.controller;

import com.pms.pharmacy.dto.PharmacySaleDto;
import com.pms.pharmacy.service.PharmacySaleService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pharmacy/sales")
public class PharmacySaleController {

    private final PharmacySaleService service;

    public PharmacySaleController(PharmacySaleService service) {
        this.service = service;
    }

    @GetMapping
    public List<PharmacySaleDto> list() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PharmacySaleDto create(@Valid @RequestBody PharmacySaleDto dto) {
        return service.create(dto);
    }
}
