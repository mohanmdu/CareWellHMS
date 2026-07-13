package com.pms.masters.service;

import com.pms.common.EntityNotFoundException;
import com.pms.masters.dto.OpBillingCategoryDto;
import com.pms.masters.entity.OpBillingCategory;
import com.pms.masters.repository.OpBillingCategoryRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class OpBillingCategoryService {

    private final OpBillingCategoryRepository repository;

    public OpBillingCategoryService(OpBillingCategoryRepository repository) {
        this.repository = repository;
    }

    public List<OpBillingCategoryDto> findActive() {
        return repository.findByActiveTrueOrderByNameAsc().stream().map(this::toDto).toList();
    }

    public List<OpBillingCategoryDto> findInactive() {
        return repository.findByActiveFalseOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public OpBillingCategoryDto create(OpBillingCategoryDto dto) {
        if (repository.existsByNameIgnoreCase(dto.name())) {
            throw new IllegalArgumentException("OP Billing Category already exists: " + dto.name());
        }
        OpBillingCategory category = new OpBillingCategory();
        category.setName(dto.name());
        category.setActive(true);
        return toDto(repository.save(category));
    }

    @Transactional
    public OpBillingCategoryDto update(Long id, OpBillingCategoryDto dto) {
        OpBillingCategory category = getOrThrow(id);
        category.setName(dto.name());
        return toDto(repository.save(category));
    }

    @Transactional
    public void deactivate(Long id) {
        OpBillingCategory category = getOrThrow(id);
        category.setActive(false);
        repository.save(category);
    }

    @Transactional
    public void restore(Long id) {
        OpBillingCategory category = getOrThrow(id);
        category.setActive(true);
        repository.save(category);
    }

    private OpBillingCategory getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("OP Billing Category not found: " + id));
    }

    private OpBillingCategoryDto toDto(OpBillingCategory category) {
        return new OpBillingCategoryDto(category.getId(), category.getName(), category.isActive());
    }
}
