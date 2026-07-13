package com.pms.masters.service;

import com.pms.common.EntityNotFoundException;
import com.pms.masters.dto.OpBillingComponentDto;
import com.pms.masters.entity.OpBillingCategory;
import com.pms.masters.entity.OpBillingComponent;
import com.pms.masters.repository.OpBillingCategoryRepository;
import com.pms.masters.repository.OpBillingComponentRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class OpBillingComponentService {

    private final OpBillingComponentRepository repository;
    private final OpBillingCategoryRepository categoryRepository;

    public OpBillingComponentService(
            OpBillingComponentRepository repository, OpBillingCategoryRepository categoryRepository) {
        this.repository = repository;
        this.categoryRepository = categoryRepository;
    }

    public List<OpBillingComponentDto> findActive() {
        return repository.findByActiveTrueOrderByNameAsc().stream().map(this::toDto).toList();
    }

    public List<OpBillingComponentDto> findInactive() {
        return repository.findByActiveFalseOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public OpBillingComponentDto create(OpBillingComponentDto dto) {
        OpBillingComponent component = new OpBillingComponent();
        applyFields(component, dto);
        component.setActive(true);
        return toDto(repository.save(component));
    }

    @Transactional
    public OpBillingComponentDto update(Long id, OpBillingComponentDto dto) {
        OpBillingComponent component = getOrThrow(id);
        applyFields(component, dto);
        return toDto(repository.save(component));
    }

    @Transactional
    public void deactivate(Long id) {
        OpBillingComponent component = getOrThrow(id);
        component.setActive(false);
        repository.save(component);
    }

    @Transactional
    public void restore(Long id) {
        OpBillingComponent component = getOrThrow(id);
        component.setActive(true);
        repository.save(component);
    }

    private void applyFields(OpBillingComponent component, OpBillingComponentDto dto) {
        OpBillingCategory category = categoryRepository.findById(dto.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("OP Billing Category not found: " + dto.categoryId()));
        component.setCategory(category);
        component.setName(dto.name());
        component.setAmount(dto.amount());
    }

    private OpBillingComponent getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("OP Billing Component not found: " + id));
    }

    private OpBillingComponentDto toDto(OpBillingComponent component) {
        return new OpBillingComponentDto(
                component.getId(),
                component.getCategory().getId(),
                component.getCategory().getName(),
                component.getName(),
                component.getAmount(),
                component.isActive());
    }
}
