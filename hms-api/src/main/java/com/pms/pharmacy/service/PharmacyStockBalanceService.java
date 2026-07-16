package com.pms.pharmacy.service;

import com.pms.pharmacy.dto.StockBalanceEntryDto;
import com.pms.pharmacy.entity.PharmacyStockTransactionType;
import com.pms.pharmacy.entity.Product;
import com.pms.pharmacy.repository.GrnItemRepository;
import com.pms.pharmacy.repository.PharmacyReturnItemRepository;
import com.pms.pharmacy.repository.PharmacySaleItemRepository;
import com.pms.pharmacy.repository.PharmacyStockTransactionRepository;
import com.pms.pharmacy.repository.ProductRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Computes the Stock Balance Report's closing-stock formula per product
 * (Opening Stock - Sale Qty + Return Qty + Intern Receipt +/- Stock
 * Adjustment) by aggregating across GrnItem/PharmacySaleItem/
 * PharmacyReturnItem/PharmacyStockTransaction, per the spec's explicit
 * formula - not by reading live PharmacyStock.quantityOnHand (the two
 * should agree in practice, a useful manual sanity check, but this report
 * is defined by the formula, not the ledger).
 */
@Service
@Transactional(readOnly = true)
public class PharmacyStockBalanceService {

    private final ProductRepository productRepository;
    private final GrnItemRepository grnItemRepository;
    private final PharmacySaleItemRepository saleItemRepository;
    private final PharmacyReturnItemRepository returnItemRepository;
    private final PharmacyStockTransactionRepository transactionRepository;

    public PharmacyStockBalanceService(
            ProductRepository productRepository,
            GrnItemRepository grnItemRepository,
            PharmacySaleItemRepository saleItemRepository,
            PharmacyReturnItemRepository returnItemRepository,
            PharmacyStockTransactionRepository transactionRepository) {
        this.productRepository = productRepository;
        this.grnItemRepository = grnItemRepository;
        this.saleItemRepository = saleItemRepository;
        this.returnItemRepository = returnItemRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<StockBalanceEntryDto> findAll() {
        return productRepository.findByActiveTrueOrderByNameAsc().stream().map(this::toEntry).toList();
    }

    private StockBalanceEntryDto toEntry(Product product) {
        int openingStock = grnItemRepository.sumReceivedQtyByProductId(product.getId());
        int saleQty = saleItemRepository.sumQuantityByProductId(product.getId());
        int returnQty = returnItemRepository.sumApprovedQuantityByProductId(product.getId());
        int internReceiptQty =
                transactionRepository.sumQuantityByProductAndType(product.getId(), PharmacyStockTransactionType.INTERNAL_RECEIPT);
        int stockAdjustmentQty =
                transactionRepository.sumQuantityByProductAndType(product.getId(), PharmacyStockTransactionType.STOCK_ADJUSTMENT);
        int closingStock = openingStock - saleQty + returnQty + internReceiptQty + stockAdjustmentQty;
        return new StockBalanceEntryDto(
                product.getId(), product.getName(), openingStock, saleQty, returnQty, internReceiptQty, stockAdjustmentQty, closingStock);
    }
}
