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

    /** Rich multi-column autocomplete for Stock Adjustment / Batch-wise Stock Modifier / Purchase Return. */
    public List<PharmacyStockDto> search(String search) {
        return repository.search(search).stream().map(this::toDto).toList();
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

    /** Signed adjustment for Internal Receipt (always positive) / Stock Adjustment (either sign). */
    @Transactional
    public PharmacyStock adjust(Long stockId, int delta) {
        PharmacyStock stock = getOrThrow(stockId);
        int newQuantity = stock.getQuantityOnHand() + delta;
        if (newQuantity < 0) {
            throw new IllegalArgumentException(
                    "Adjustment would take " + stock.getProductName() + " (batch " + stock.getBatch() + ") below zero - only "
                            + stock.getQuantityOnHand() + " available");
        }
        stock.setQuantityOnHand(newQuantity);
        return repository.save(stock);
    }

    @Transactional
    public PharmacyStockDto updatePacking(Long stockId, int quantityOnHand, int packing) {
        PharmacyStock stock = getOrThrow(stockId);
        stock.setQuantityOnHand(quantityOnHand);
        stock.setPacking(packing);
        return toDto(repository.save(stock));
    }

    @Transactional
    public PharmacyStockDto updateMrp(Long stockId, double mrp) {
        PharmacyStock stock = getOrThrow(stockId);
        stock.setMrp(mrp);
        return toDto(repository.save(stock));
    }

    /**
     * Guards GrnService.delete() for an already-APPROVED Grn - deleting one
     * reverses the receipt entirely (including removing the stock row), so
     * it's only safe while nothing has been sold/adjusted/returned from it yet.
     */
    public void assertUntouchedSinceGrn(GrnItem grnItem) {
        PharmacyStock stock = repository.findByGrnItemId(grnItem.getId())
                .orElseThrow(() -> new EntityNotFoundException("Pharmacy Stock not found for GRN item: " + grnItem.getId()));
        int originallyCredited = grnItem.getTotalQty() + grnItem.getFreeQty();
        if (stock.getQuantityOnHand() != originallyCredited) {
            throw new IllegalArgumentException(
                    "Cannot delete GRN - stock for " + stock.getProductName() + " (batch " + stock.getBatch() + ") has already moved.");
        }
    }

    @Transactional
    public void deleteForGrnItem(GrnItem grnItem) {
        repository.findByGrnItemId(grnItem.getId()).ifPresent(repository::delete);
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
                stock.getQuantityOnHand(),
                stock.getPacking());
    }
}
