package com.pms.pharmacy.service;

import com.pms.common.EntityNotFoundException;
import com.pms.pharmacy.dto.DrugBatchDto;
import com.pms.pharmacy.entity.Drug;
import com.pms.pharmacy.entity.DrugBatch;
import com.pms.pharmacy.repository.DrugBatchRepository;
import com.pms.pharmacy.repository.DrugRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Replaces the legacy GRN/stock-entry screens (ProductEntryForGrn,
 * addStockEntry - migration doc §4.3). Simplified: this models the "stock
 * now exists in a batch" outcome of procurement, not the full
 * vendor/quotation/GRN-approval workflow - extend with a proper GRN header
 * (vendor, PO reference) before this touches real procurement data.
 */
@Service
@Transactional(readOnly = true)
public class DrugBatchService {

    private final DrugBatchRepository repository;
    private final DrugRepository drugRepository;

    public DrugBatchService(DrugBatchRepository repository, DrugRepository drugRepository) {
        this.repository = repository;
        this.drugRepository = drugRepository;
    }

    public List<DrugBatchDto> findAll() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public DrugBatchDto receiveStock(DrugBatchDto dto) {
        Drug drug = drugRepository.findById(dto.drugId())
                .orElseThrow(() -> new EntityNotFoundException("Drug not found: " + dto.drugId()));
        DrugBatch batch = new DrugBatch();
        batch.setDrug(drug);
        batch.setBatchNumber(dto.batchNumber());
        batch.setExpiryDate(dto.expiryDate());
        batch.setQuantityOnHand(dto.quantityOnHand() != null ? dto.quantityOnHand() : 0);
        batch.setPurchasePrice(dto.purchasePrice() != null ? dto.purchasePrice() : 0.0);
        batch.setSellingPrice(dto.sellingPrice() != null ? dto.sellingPrice() : 0.0);
        return toDto(repository.save(batch));
    }

    private DrugBatchDto toDto(DrugBatch batch) {
        return new DrugBatchDto(
                batch.getId(),
                batch.getDrug().getId(),
                batch.getDrug().getName(),
                batch.getBatchNumber(),
                batch.getExpiryDate(),
                batch.getQuantityOnHand(),
                batch.getPurchasePrice(),
                batch.getSellingPrice());
    }
}
