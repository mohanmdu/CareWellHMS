package com.pms.pharmacy.controller;

import com.pms.pharmacy.dto.ApprovePurchaseOrderRequest;
import com.pms.pharmacy.dto.PurchaseOrderDto;
import com.pms.pharmacy.dto.PurchaseOrderListEntryDto;
import com.pms.pharmacy.dto.PurchaseOrderRequest;
import com.pms.pharmacy.entity.PurchaseOrderStatus;
import com.pms.pharmacy.service.PurchaseOrderService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pharmacy/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService service;

    public PurchaseOrderController(PurchaseOrderService service) {
        this.service = service;
    }

    @GetMapping
    public List<PurchaseOrderListEntryDto> list(@RequestParam PurchaseOrderStatus status) {
        return service.findByStatus(status);
    }

    @GetMapping("/{id}")
    public PurchaseOrderDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseOrderDto create(@Valid @RequestBody PurchaseOrderRequest request) {
        return service.create(request);
    }

    @PatchMapping("/{id}/approve")
    public PurchaseOrderDto approve(@PathVariable Long id, @Valid @RequestBody ApprovePurchaseOrderRequest request) {
        return service.approve(id, request);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        service.cancel(id);
        return ResponseEntity.noContent().build();
    }
}
