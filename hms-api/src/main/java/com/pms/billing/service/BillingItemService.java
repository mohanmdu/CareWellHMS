package com.pms.billing.service;

import com.pms.billing.dto.BillingItemDto;
import com.pms.billing.entity.BillingCategory;
import com.pms.billing.entity.BillingItem;
import com.pms.billing.repository.BillingCategoryRepository;
import com.pms.billing.repository.BillingItemRepository;
import com.pms.common.EntityNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class BillingItemService {

    private final BillingItemRepository repository;
    private final BillingCategoryRepository categoryRepository;

    public BillingItemService(BillingItemRepository repository, BillingCategoryRepository categoryRepository) {
        this.repository = repository;
        this.categoryRepository = categoryRepository;
    }

    public List<BillingItemDto> findAll() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public BillingItemDto create(BillingItemDto dto) {
        BillingCategory category = categoryRepository.findById(dto.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("Billing category not found: " + dto.categoryId()));
        BillingItem item = new BillingItem();
        item.setName(dto.name());
        item.setCategory(category);
        item.setPrice(dto.price() != null ? dto.price() : 0.0);
        item.setActive(true);
        return toDto(repository.save(item));
    }

    @Transactional
    public void deactivate(Long id) {
        BillingItem item = getOrThrow(id);
        item.setActive(false);
        repository.save(item);
    }

    private BillingItem getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Billing item not found: " + id));
    }

    private BillingItemDto toDto(BillingItem item) {
        return new BillingItemDto(
                item.getId(), item.getName(), item.getCategory().getId(), item.getCategory().getName(), item.getPrice(), item.isActive());
    }
}
