package com.pms.pharmacy.service;

import com.pms.common.EntityNotFoundException;
import com.pms.pharmacy.dto.PharmacySaleDto;
import com.pms.pharmacy.dto.PharmacySaleItemDto;
import com.pms.pharmacy.entity.DrugBatch;
import com.pms.pharmacy.entity.PharmacySale;
import com.pms.pharmacy.entity.PharmacySaleItem;
import com.pms.pharmacy.repository.DrugBatchRepository;
import com.pms.pharmacy.repository.PharmacySaleRepository;
import com.pms.registration.entity.Patient;
import com.pms.registration.repository.PatientRepository;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Replaces PharmacyAction.addProductEntrySale / PharmacyDaoImpl.addPharmacySaleComponents
 * (migration doc §4.3, risk R10). The legacy stock decrement was a raw HQL
 * bulk UPDATE with no negative-stock guard and no locking - a real
 * overselling race condition under concurrent dispensing. This version:
 *  1. Explicitly checks quantityOnHand before decrementing (business rule),
 *  2. Relies on DrugBatch's @Version for optimistic locking, so two
 *     concurrent sales against the same batch can't both succeed silently -
 *     the loser gets an ObjectOptimisticLockingFailureException, translated
 *     to HTTP 409 by GlobalExceptionHandler, and must retry.
 */
@Service
@Transactional(readOnly = true)
public class PharmacySaleService {

    private final PharmacySaleRepository repository;
    private final PatientRepository patientRepository;
    private final DrugBatchRepository batchRepository;
    private final AtomicInteger sequence = new AtomicInteger(0);

    public PharmacySaleService(
            PharmacySaleRepository repository, PatientRepository patientRepository, DrugBatchRepository batchRepository) {
        this.repository = repository;
        this.patientRepository = patientRepository;
        this.batchRepository = batchRepository;
        this.sequence.set((int) repository.count());
    }

    public List<PharmacySaleDto> findAll() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public PharmacySaleDto create(PharmacySaleDto dto) {
        Patient patient = patientRepository.findById(dto.patientId())
                .orElseThrow(() -> new EntityNotFoundException("Patient not found: " + dto.patientId()));

        PharmacySale sale = new PharmacySale();
        sale.setSaleNumber(nextSaleNumber());
        sale.setPatient(patient);

        double total = 0;
        List<PharmacySaleItem> items = new ArrayList<>();
        for (PharmacySaleItemDto itemDto : dto.items()) {
            DrugBatch batch = batchRepository.findById(itemDto.batchId())
                    .orElseThrow(() -> new EntityNotFoundException("Drug batch not found: " + itemDto.batchId()));

            if (batch.getQuantityOnHand() < itemDto.quantity()) {
                throw new IllegalArgumentException(
                        "Insufficient stock for " + batch.getDrug().getName() + " batch " + batch.getBatchNumber()
                                + ": requested " + itemDto.quantity() + ", available " + batch.getQuantityOnHand());
            }
            batch.setQuantityOnHand(batch.getQuantityOnHand() - itemDto.quantity());
            batchRepository.save(batch); // flush triggers @Version check

            PharmacySaleItem item = new PharmacySaleItem();
            item.setSale(sale);
            item.setBatch(batch);
            item.setDrugName(batch.getDrug().getName());
            item.setQuantity(itemDto.quantity());
            item.setUnitPrice(batch.getSellingPrice());
            double lineTotal = batch.getSellingPrice() * itemDto.quantity();
            item.setLineTotal(lineTotal);
            total += lineTotal;
            items.add(item);
        }
        sale.setItems(items);
        sale.setTotalAmount(total);

        return toDto(repository.save(sale));
    }

    private String nextSaleNumber() {
        return "RX-" + Year.now().getValue() + "-" + String.format("%05d", sequence.incrementAndGet());
    }

    private PharmacySaleDto toDto(PharmacySale sale) {
        List<PharmacySaleItemDto> items = sale.getItems().stream()
                .map(i -> new PharmacySaleItemDto(i.getId(), i.getBatch().getId(), i.getDrugName(), i.getQuantity(), i.getUnitPrice(), i.getLineTotal()))
                .toList();
        Patient patient = sale.getPatient();
        return new PharmacySaleDto(
                sale.getId(),
                sale.getSaleNumber(),
                patient.getId(),
                (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim(),
                sale.getTotalAmount(),
                items);
    }
}
