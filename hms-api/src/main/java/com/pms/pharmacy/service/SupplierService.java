package com.pms.pharmacy.service;

import com.pms.common.EntityNotFoundException;
import com.pms.pharmacy.dto.SupplierDto;
import com.pms.pharmacy.entity.Supplier;
import com.pms.pharmacy.repository.SupplierRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SupplierService {

    private final SupplierRepository repository;

    public SupplierService(SupplierRepository repository) {
        this.repository = repository;
    }

    public List<SupplierDto> findActive() {
        return repository.findByActiveTrueOrderByNameAsc().stream().map(this::toDto).toList();
    }

    public List<SupplierDto> findInactive() {
        return repository.findByActiveFalseOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public SupplierDto create(SupplierDto dto) {
        Supplier supplier = new Supplier();
        applyFields(supplier, dto);
        supplier.setActive(true);
        return toDto(repository.save(supplier));
    }

    @Transactional
    public SupplierDto update(Long id, SupplierDto dto) {
        Supplier supplier = getOrThrow(id);
        applyFields(supplier, dto);
        return toDto(repository.save(supplier));
    }

    @Transactional
    public void deactivate(Long id) {
        Supplier supplier = getOrThrow(id);
        supplier.setActive(false);
        repository.save(supplier);
    }

    @Transactional
    public void restore(Long id) {
        Supplier supplier = getOrThrow(id);
        supplier.setActive(true);
        repository.save(supplier);
    }

    private void applyFields(Supplier supplier, SupplierDto dto) {
        supplier.setName(dto.name());
        supplier.setContactPersonName(dto.contactPersonName());
        supplier.setMobileNumber(dto.mobileNumber());
        supplier.setAddress(dto.address());
        supplier.setCity(dto.city());
        supplier.setLandlineNumber(dto.landlineNumber());
    }

    private Supplier getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Supplier not found: " + id));
    }

    private SupplierDto toDto(Supplier supplier) {
        return new SupplierDto(
                supplier.getId(),
                supplier.getName(),
                supplier.getContactPersonName(),
                supplier.getMobileNumber(),
                supplier.getAddress(),
                supplier.getCity(),
                supplier.getLandlineNumber(),
                supplier.isActive());
    }
}
