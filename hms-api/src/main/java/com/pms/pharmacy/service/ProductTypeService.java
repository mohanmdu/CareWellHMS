package com.pms.pharmacy.service;

import com.pms.common.EntityNotFoundException;
import com.pms.pharmacy.dto.ProductTypeDto;
import com.pms.pharmacy.entity.ProductType;
import com.pms.pharmacy.repository.ProductTypeRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProductTypeService {

    private final ProductTypeRepository repository;

    public ProductTypeService(ProductTypeRepository repository) {
        this.repository = repository;
    }

    public List<ProductTypeDto> findActive() {
        return repository.findByActiveTrueOrderByNameAsc().stream().map(this::toDto).toList();
    }

    public List<ProductTypeDto> findInactive() {
        return repository.findByActiveFalseOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public ProductTypeDto create(ProductTypeDto dto) {
        if (repository.existsByNameIgnoreCase(dto.name())) {
            throw new IllegalArgumentException("Product Type already exists: " + dto.name());
        }
        ProductType productType = new ProductType();
        productType.setName(dto.name());
        productType.setActive(true);
        return toDto(repository.save(productType));
    }

    @Transactional
    public ProductTypeDto update(Long id, ProductTypeDto dto) {
        ProductType productType = getOrThrow(id);
        productType.setName(dto.name());
        return toDto(repository.save(productType));
    }

    @Transactional
    public void deactivate(Long id) {
        ProductType productType = getOrThrow(id);
        productType.setActive(false);
        repository.save(productType);
    }

    @Transactional
    public void restore(Long id) {
        ProductType productType = getOrThrow(id);
        productType.setActive(true);
        repository.save(productType);
    }

    private ProductType getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Product Type not found: " + id));
    }

    private ProductTypeDto toDto(ProductType productType) {
        return new ProductTypeDto(productType.getId(), productType.getName(), productType.isActive());
    }
}
