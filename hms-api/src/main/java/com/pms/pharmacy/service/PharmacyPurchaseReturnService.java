package com.pms.pharmacy.service;

import com.pms.common.EntityNotFoundException;
import com.pms.pharmacy.dto.PharmacyPurchaseReturnDto;
import com.pms.pharmacy.dto.PharmacyPurchaseReturnEligibleItemDto;
import com.pms.pharmacy.dto.PharmacyPurchaseReturnItemDto;
import com.pms.pharmacy.dto.PharmacyPurchaseReturnItemRequest;
import com.pms.pharmacy.dto.PharmacyPurchaseReturnRequest;
import com.pms.pharmacy.dto.PharmacyPurchaseReturnSummaryDto;
import com.pms.pharmacy.entity.PharmacyPurchaseReturn;
import com.pms.pharmacy.entity.PharmacyPurchaseReturnItem;
import com.pms.pharmacy.entity.PharmacyStock;
import com.pms.pharmacy.entity.Supplier;
import com.pms.pharmacy.repository.PharmacyPurchaseReturnRepository;
import com.pms.pharmacy.repository.PharmacyStockRepository;
import com.pms.pharmacy.repository.SupplierRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Purchase Return - single-step (immediate), unlike PharmacyReturnService's
 * PENDING/APPROVED workflow: no separate approval module was requested for
 * this one. create() decrements PharmacyStock immediately via the existing
 * PharmacyStockService.decrement() - there is no pending state.
 */
@Service
@Transactional(readOnly = true)
public class PharmacyPurchaseReturnService {

    private final PharmacyPurchaseReturnRepository repository;
    private final PharmacyStockRepository stockRepository;
    private final SupplierRepository supplierRepository;
    private final PharmacyStockService stockService;

    public PharmacyPurchaseReturnService(
            PharmacyPurchaseReturnRepository repository,
            PharmacyStockRepository stockRepository,
            SupplierRepository supplierRepository,
            PharmacyStockService stockService) {
        this.repository = repository;
        this.stockRepository = stockRepository;
        this.supplierRepository = supplierRepository;
        this.stockService = stockService;
    }

    public List<PharmacyPurchaseReturnEligibleItemDto> findEligibleStock(
            Long supplierId, String drugName, LocalDate fromDate, LocalDate toDate) {
        return stockRepository.findEligibleForPurchaseReturn(supplierId, drugName, fromDate, toDate).stream()
                .map(this::toEligibleItemDto)
                .toList();
    }

    @Transactional
    public PharmacyPurchaseReturnDto create(PharmacyPurchaseReturnRequest request) {
        Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found: " + request.supplierId()));

        List<PharmacyPurchaseReturnItem> items = new ArrayList<>();
        double total = 0;
        for (PharmacyPurchaseReturnItemRequest itemRequest : request.items()) {
            PharmacyStock stock = stockRepository.findById(itemRequest.stockId())
                    .orElseThrow(() -> new EntityNotFoundException("Pharmacy Stock not found: " + itemRequest.stockId()));

            double purchaseRate = stock.getPurchaseRate() != null ? stock.getPurchaseRate() : 0.0;
            double netAmount = purchaseRate * itemRequest.quantity();

            PharmacyPurchaseReturnItem item = new PharmacyPurchaseReturnItem();
            item.setStock(stock);
            item.setProductName(stock.getProductName());
            item.setBatch(stock.getBatch());
            item.setMrp(stock.getMrp());
            item.setPurchaseRate(stock.getPurchaseRate());
            item.setQuantity(itemRequest.quantity());
            item.setNetAmount(netAmount);
            items.add(item);
            total += netAmount;

            stockService.decrement(stock.getId(), itemRequest.quantity());
        }

        PharmacyPurchaseReturn purchaseReturn = new PharmacyPurchaseReturn();
        purchaseReturn.setSupplier(supplier);
        purchaseReturn.setReturnType(request.returnType());
        purchaseReturn.setRemarks(request.remarks());
        purchaseReturn.setTotalAmount(total);
        purchaseReturn.setReturnedBy(currentUsername());
        items.forEach(item -> item.setPurchaseReturn(purchaseReturn));
        purchaseReturn.setItems(items);

        return toDto(repository.save(purchaseReturn));
    }

    public PharmacyPurchaseReturnDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    public List<PharmacyPurchaseReturnSummaryDto> search(Instant fromInstant, Instant toInstant) {
        return repository.search(fromInstant, toInstant).stream().map(this::toSummaryDto).toList();
    }

    private PharmacyPurchaseReturn getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Purchase Return not found: " + id));
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private PharmacyPurchaseReturnEligibleItemDto toEligibleItemDto(PharmacyStock stock) {
        var grnItem = stock.getGrnItem();
        return new PharmacyPurchaseReturnEligibleItemDto(
                stock.getId(),
                grnItem.getGrn().getInvoiceNo(),
                stock.getProductName(),
                stock.getProductTypeName(),
                stock.getBatch(),
                grnItem.getTotalQty() + grnItem.getFreeQty(),
                stock.getQuantityOnHand(),
                stock.getPurchaseRate(),
                stock.getMrp());
    }

    private PharmacyPurchaseReturnSummaryDto toSummaryDto(PharmacyPurchaseReturn purchaseReturn) {
        return new PharmacyPurchaseReturnSummaryDto(
                purchaseReturn.getId(),
                purchaseReturn.getReturnType(),
                purchaseReturn.getRemarks(),
                purchaseReturn.getTotalAmount(),
                purchaseReturn.getReturnedBy(),
                purchaseReturn.getCreatedAt());
    }

    private PharmacyPurchaseReturnDto toDto(PharmacyPurchaseReturn purchaseReturn) {
        Supplier supplier = purchaseReturn.getSupplier();
        List<PharmacyPurchaseReturnItemDto> items = purchaseReturn.getItems().stream()
                .map(item -> new PharmacyPurchaseReturnItemDto(
                        item.getId(),
                        item.getStock().getId(),
                        item.getProductName(),
                        item.getBatch(),
                        item.getMrp(),
                        item.getPurchaseRate(),
                        item.getQuantity(),
                        item.getNetAmount()))
                .toList();
        return new PharmacyPurchaseReturnDto(
                purchaseReturn.getId(),
                supplier.getId(),
                supplier.getName(),
                supplier.getAddress(),
                supplier.getMobileNumber(),
                purchaseReturn.getReturnType(),
                purchaseReturn.getRemarks(),
                items,
                purchaseReturn.getTotalAmount(),
                purchaseReturn.getReturnedBy(),
                purchaseReturn.getCreatedAt());
    }
}
