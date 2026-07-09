package com.pms.billing.service;

import com.pms.billing.dto.BillingCategoryDto;
import com.pms.billing.entity.BillingCategory;
import com.pms.billing.repository.BillingCategoryRepository;
import com.pms.common.EntityNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class BillingCategoryService {

    private final BillingCategoryRepository repository;

    public BillingCategoryService(BillingCategoryRepository repository) {
        this.repository = repository;
    }

    public List<BillingCategoryDto> findAll() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public BillingCategoryDto create(BillingCategoryDto dto) {
        if (repository.existsByNameIgnoreCase(dto.name())) {
            throw new IllegalArgumentException("Billing category already exists: " + dto.name());
        }
        BillingCategory category = new BillingCategory();
        category.setName(dto.name());
        category.setActive(true);
        return toDto(repository.save(category));
    }

    @Transactional
    public void deactivate(Long id) {
        BillingCategory category = getOrThrow(id);
        category.setActive(false);
        repository.save(category);
    }

    private BillingCategory getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Billing category not found: " + id));
    }

    private BillingCategoryDto toDto(BillingCategory category) {
        return new BillingCategoryDto(category.getId(), category.getName(), category.isActive());
    }
}
