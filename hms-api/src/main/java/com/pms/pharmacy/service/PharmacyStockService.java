package com.pms.pharmacy.service;

import com.pms.common.EntityNotFoundException;
import com.pms.pharmacy.dto.PharmacyStockDto;
import com.pms.pharmacy.entity.GrnItem;
import com.pms.pharmacy.entity.PharmacyStock;
import com.pms.pharmacy.repository.PharmacyStockRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Owns the sellable stock ledger. Stock is only ever created here
 * (creditFromGrnItem, called once by GrnService when a Grn transitions to
 * APPROVED) and only ever reduced here (decrement, called by
 * PharmacySaleService) or increased back (credit, called by
 * PharmacyReturnService) - no other code should touch quantityOnHand
 * directly, so the @Version optimistic lock on PharmacyStock is the single
 * place overselling under concurrent billing gets caught.
 */
@Service
@Transactional(readOnly = true)
public class PharmacyStockService {

    private final PharmacyStockRepository repository;

    public PharmacyStockService(PharmacyStockRepository repository) {
        this.repository = repository;
    }

    public List<PharmacyStockDto> findAvailable() {
        return repository.findByQuantityOnHandGreaterThanOrderByProductNameAsc(0).stream().map(this::toDto).toList();
    }

    public List<PharmacyStockDto> findAvailableForProduct(Long productId) {
        return repository.findByProductIdAndQuantityOnHandGreaterThanOrderByExpiryDateAsc(productId, 0).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public void creditFromGrnItem(GrnItem grnItem) {
        PharmacyStock stock = new PharmacyStock();
        stock.setGrnItem(grnItem);
        stock.setProduct(grnItem.getProduct());
        stock.setProductName(grnItem.getProductName());
        stock.setProductTypeName(grnItem.getProductTypeName());
        stock.setBatch(grnItem.getBatch());
        stock.setExpiryDate(grnItem.getExpiryDate());
        stock.setManufactureDate(grnItem.getManufactureDate());
        stock.setMrp(grnItem.getMrp());
        stock.setPurchaseRate(grnItem.getPurchaseRate());
        stock.setQuantityOnHand(grnItem.getTotalQty() + grnItem.getFreeQty());
        repository.save(stock);
    }

    @Transactional
    public PharmacyStock decrement(Long stockId, int quantity) {
        PharmacyStock stock = getOrThrow(stockId);
        if (stock.getQuantityOnHand() < quantity) {
            throw new IllegalArgumentException(
                    "Insufficient stock for " + stock.getProductName() + " (batch " + stock.getBatch() + "): only "
                            + stock.getQuantityOnHand() + " available");
        }
        stock.setQuantityOnHand(stock.getQuantityOnHand() - quantity);
        return repository.save(stock);
    }

    @Transactional
    public void credit(Long stockId, int quantity) {
        PharmacyStock stock = getOrThrow(stockId);
        stock.setQuantityOnHand(stock.getQuantityOnHand() + quantity);
        repository.save(stock);
    }

    private PharmacyStock getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Pharmacy Stock not found: " + id));
    }

    private PharmacyStockDto toDto(PharmacyStock stock) {
        return new PharmacyStockDto(
                stock.getId(),
                stock.getProduct().getId(),
                stock.getProductName(),
                stock.getProductTypeName(),
                stock.getBatch(),
                stock.getExpiryDate(),
                stock.getManufactureDate(),
                stock.getMrp(),
                stock.getPurchaseRate(),
                stock.getQuantityOnHand());
    }
}
