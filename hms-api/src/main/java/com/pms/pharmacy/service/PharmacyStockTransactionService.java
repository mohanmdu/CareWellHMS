package com.pms.pharmacy.service;

import com.pms.common.EntityNotFoundException;
import com.pms.pharmacy.dto.PharmacyStockTransactionDto;
import com.pms.pharmacy.dto.PharmacyStockTransactionRequest;
import com.pms.pharmacy.entity.PharmacyLocation;
import com.pms.pharmacy.entity.PharmacyStock;
import com.pms.pharmacy.entity.PharmacyStockTransaction;
import com.pms.pharmacy.entity.PharmacyStockTransactionType;
import com.pms.pharmacy.repository.PharmacyLocationRepository;
import com.pms.pharmacy.repository.PharmacyStockRepository;
import com.pms.pharmacy.repository.PharmacyStockTransactionRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Internal Receipt and Stock Adjustment - two names for the same underlying
 * operation (see PharmacyStockTransaction's class doc): apply a signed
 * quantity delta to an existing PharmacyStock batch via
 * PharmacyStockService.adjust, and log it here for the Stock Adjustment
 * Report's two grids. Internal Receipt quantities are expected to be
 * positive; Stock Adjustment may be either sign - this service doesn't
 * enforce the sign itself, trusting the frontend's per-type input (an
 * Internal Receipt submitted with a negative quantity would still be a
 * logically odd but harmless entry, same posture as other quantity fields
 * in this codebase that don't re-validate business-meaning beyond the sign
 * needed for correctness elsewhere - i.e. never taking stock negative,
 * which PharmacyStockService.adjust already guards).
 */
@Service
@Transactional(readOnly = true)
public class PharmacyStockTransactionService {

    private final PharmacyStockTransactionRepository repository;
    private final PharmacyStockRepository stockRepository;
    private final PharmacyLocationRepository locationRepository;
    private final PharmacyStockService stockService;

    public PharmacyStockTransactionService(
            PharmacyStockTransactionRepository repository,
            PharmacyStockRepository stockRepository,
            PharmacyLocationRepository locationRepository,
            PharmacyStockService stockService) {
        this.repository = repository;
        this.stockRepository = stockRepository;
        this.locationRepository = locationRepository;
        this.stockService = stockService;
    }

    @Transactional
    public PharmacyStockTransactionDto create(PharmacyStockTransactionRequest request) {
        PharmacyStock stock = stockRepository.findById(request.stockId())
                .orElseThrow(() -> new EntityNotFoundException("Pharmacy Stock not found: " + request.stockId()));
        PharmacyLocation location = locationRepository.findById(request.locationId())
                .orElseThrow(() -> new EntityNotFoundException("Pharmacy Location not found: " + request.locationId()));

        stockService.adjust(stock.getId(), request.quantity());

        PharmacyStockTransaction transaction = new PharmacyStockTransaction();
        transaction.setStock(stock);
        transaction.setProductName(stock.getProductName());
        transaction.setBatch(stock.getBatch());
        transaction.setTransactionType(request.transactionType());
        transaction.setQuantity(request.quantity());
        transaction.setLocation(location);
        transaction.setReason(request.reason());
        transaction.setUpdatedBy(currentUsername());
        transaction.setUpdatedAt(Instant.now());

        return toDto(repository.save(transaction));
    }

    public List<PharmacyStockTransactionDto> search(
            PharmacyStockTransactionType type, Long locationId, Instant fromInstant, Instant toInstant) {
        return repository.search(type, locationId, fromInstant, toInstant).stream().map(this::toDto).toList();
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private PharmacyStockTransactionDto toDto(PharmacyStockTransaction transaction) {
        PharmacyLocation location = transaction.getLocation();
        return new PharmacyStockTransactionDto(
                transaction.getId(),
                transaction.getStock().getId(),
                transaction.getProductName(),
                transaction.getBatch(),
                transaction.getTransactionType(),
                transaction.getQuantity(),
                location.getId(),
                location.getName(),
                transaction.getReason(),
                transaction.getUpdatedBy(),
                transaction.getUpdatedAt());
    }
}
