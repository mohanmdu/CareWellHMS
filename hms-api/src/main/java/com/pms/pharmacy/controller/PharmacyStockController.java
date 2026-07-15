package com.pms.pharmacy.controller;

import com.pms.pharmacy.dto.PharmacyStockDto;
import com.pms.pharmacy.service.PharmacyStockService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pharmacy/stock")
public class PharmacyStockController {

    private final PharmacyStockService service;

    public PharmacyStockController(PharmacyStockService service) {
        this.service = service;
    }

    @GetMapping
    public List<PharmacyStockDto> list(@RequestParam(required = false) Long productId) {
        return productId != null ? service.findAvailableForProduct(productId) : service.findAvailable();
    }
}
