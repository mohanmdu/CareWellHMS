package com.pms.pharmacy.controller;

import com.pms.pharmacy.dto.DrugBatchDto;
import com.pms.pharmacy.service.DrugBatchService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pharmacy/batches")
public class DrugBatchController {

    private final DrugBatchService service;

    public DrugBatchController(DrugBatchService service) {
        this.service = service;
    }

    @GetMapping
    public List<DrugBatchDto> list() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DrugBatchDto receiveStock(@Valid @RequestBody DrugBatchDto dto) {
        return service.receiveStock(dto);
    }
}
