package com.pms.lab.service;

import com.pms.common.EntityNotFoundException;
import com.pms.lab.dto.LabCategoryDto;
import com.pms.lab.entity.LabCategory;
import com.pms.lab.repository.LabCategoryRepository;
import com.pms.lab.repository.LabComponentRepository;
import com.pms.lab.repository.LabSubCategoryRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Lab Category: top of the Category -> Sub-Category -> Component master
 * hierarchy. Delete is a real (hard) delete, matching the reference screen's
 * plain "DELETE" action rather than this codebase's usual deactivate/restore
 * pattern - it cascades through LabCategory.subCategories and
 * LabSubCategory.components (both CascadeType.ALL + orphanRemoval), so
 * deleting a category also removes everything under it.
 */
@Service
@Transactional(readOnly = true)
public class LabCategoryService {

    private final LabCategoryRepository repository;
    private final LabSubCategoryRepository subCategoryRepository;
    private final LabComponentRepository componentRepository;

    public LabCategoryService(
            LabCategoryRepository repository,
            LabSubCategoryRepository subCategoryRepository,
            LabComponentRepository componentRepository) {
        this.repository = repository;
        this.subCategoryRepository = subCategoryRepository;
        this.componentRepository = componentRepository;
    }

    public List<LabCategoryDto> findAll() {
        return repository.findAllByOrderByOrderingNoAsc().stream().map(this::toDto).toList();
    }

    public List<LabCategoryDto> search(String query) {
        String trimmed = query == null ? "" : query.trim();
        if (trimmed.isEmpty()) {
            return List.of();
        }
        return repository.search(trimmed).stream().limit(20).map(this::toDto).toList();
    }

    @Transactional
    public LabCategoryDto create(LabCategoryDto dto) {
        if (repository.existsByNameIgnoreCase(dto.name())) {
            throw new IllegalArgumentException("Category " + dto.name() + " already exists");
        }
        LabCategory category = new LabCategory();
        applyFields(category, dto);
        return toDto(repository.save(category));
    }

    @Transactional
    public LabCategoryDto update(Long id, LabCategoryDto dto) {
        LabCategory category = getOrThrow(id);
        if (!category.getName().equalsIgnoreCase(dto.name()) && repository.existsByNameIgnoreCase(dto.name())) {
            throw new IllegalArgumentException("Category " + dto.name() + " already exists");
        }
        applyFields(category, dto);
        return toDto(repository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        LabCategory category = getOrThrow(id);
        repository.delete(category);
    }

    private void applyFields(LabCategory category, LabCategoryDto dto) {
        category.setName(dto.name().trim());
        category.setOpAmount(dto.opAmount() != null ? dto.opAmount() : 0);
        category.setIpAmount(dto.ipAmount() != null ? dto.ipAmount() : 0);
        category.setOrderingNo(dto.orderingNo() != null ? dto.orderingNo() : 0);
    }

    private LabCategory getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Lab category not found: " + id));
    }

    private LabCategoryDto toDto(LabCategory category) {
        long subCategoryCount = subCategoryRepository.countByCategoryId(category.getId());
        long componentCount = componentRepository.countByCategoryId(category.getId());
        return new LabCategoryDto(
                category.getId(),
                category.getName(),
                category.getOpAmount(),
                category.getIpAmount(),
                category.getOrderingNo(),
                subCategoryCount,
                componentCount);
    }
}
