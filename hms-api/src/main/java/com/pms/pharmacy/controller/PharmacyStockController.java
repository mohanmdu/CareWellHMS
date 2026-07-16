package com.pms.pharmacy.controller;

import com.pms.pharmacy.dto.PharmacyStockDto;
import com.pms.pharmacy.dto.PharmacyStockUpdateMrpRequest;
import com.pms.pharmacy.dto.PharmacyStockUpdatePackingRequest;
import com.pms.pharmacy.dto.StockBalanceEntryDto;
import com.pms.pharmacy.service.PharmacyStockBalanceService;
import com.pms.pharmacy.service.PharmacyStockService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pharmacy/stock")
public class PharmacyStockController {

    private final PharmacyStockService service;
    private final PharmacyStockBalanceService balanceService;

    public PharmacyStockController(PharmacyStockService service, PharmacyStockBalanceService balanceService) {
        this.service = service;
        this.balanceService = balanceService;
    }

    @GetMapping
    public List<PharmacyStockDto> list(@RequestParam(required = false) Long productId, @RequestParam(required = false) String search) {
        if (productId != null) {
            return service.findAvailableForProduct(productId);
        }
        if (search != null) {
            return service.search(search);
        }
        return service.findAvailable();
    }

    @PatchMapping("/{id}/packing")
    public PharmacyStockDto updatePacking(@PathVariable Long id, @Valid @RequestBody PharmacyStockUpdatePackingRequest request) {
        return service.updatePacking(id, request.quantityOnHand(), request.packing());
    }

    @PatchMapping("/{id}/mrp")
    public PharmacyStockDto updateMrp(@PathVariable Long id, @Valid @RequestBody PharmacyStockUpdateMrpRequest request) {
        return service.updateMrp(id, request.mrp());
    }

    @GetMapping("/balance-report")
    public List<StockBalanceEntryDto> balanceReport() {
        return balanceService.findAll();
    }
}
