package com.pms.masters.service;

import com.pms.common.EntityNotFoundException;
import com.pms.masters.dto.IpBillingCategoryDto;
import com.pms.masters.entity.IpBillingCategory;
import com.pms.masters.repository.IpBillingCategoryRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class IpBillingCategoryService {

    private final IpBillingCategoryRepository repository;

    public IpBillingCategoryService(IpBillingCategoryRepository repository) {
        this.repository = repository;
    }

    public List<IpBillingCategoryDto> findActive() {
        return repository.findByActiveTrueOrderByNameAsc().stream().map(this::toDto).toList();
    }

    public List<IpBillingCategoryDto> findInactive() {
        return repository.findByActiveFalseOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public IpBillingCategoryDto create(IpBillingCategoryDto dto) {
        if (repository.existsByNameIgnoreCase(dto.name())) {
            throw new IllegalArgumentException("IP Billing Category already exists: " + dto.name());
        }
        IpBillingCategory category = new IpBillingCategory();
        category.setName(dto.name());
        category.setActive(true);
        return toDto(repository.save(category));
    }

    @Transactional
    public IpBillingCategoryDto update(Long id, IpBillingCategoryDto dto) {
        IpBillingCategory category = getOrThrow(id);
        category.setName(dto.name());
        return toDto(repository.save(category));
    }

    @Transactional
    public void deactivate(Long id) {
        IpBillingCategory category = getOrThrow(id);
        category.setActive(false);
        repository.save(category);
    }

    @Transactional
    public void restore(Long id) {
        IpBillingCategory category = getOrThrow(id);
        category.setActive(true);
        repository.save(category);
    }

    private IpBillingCategory getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("IP Billing Category not found: " + id));
    }

    private IpBillingCategoryDto toDto(IpBillingCategory category) {
        return new IpBillingCategoryDto(category.getId(), category.getName(), category.isActive());
    }
}
