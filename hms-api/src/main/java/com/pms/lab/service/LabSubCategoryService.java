package com.pms.lab.service;

import com.pms.common.EntityNotFoundException;
import com.pms.lab.dto.LabSubCategoryDto;
import com.pms.lab.entity.LabCategory;
import com.pms.lab.entity.LabSubCategory;
import com.pms.lab.repository.LabCategoryRepository;
import com.pms.lab.repository.LabComponentRepository;
import com.pms.lab.repository.LabSubCategoryRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Lab Sub-Category: middle of the master hierarchy, scoped to one LabCategory. */
@Service
@Transactional(readOnly = true)
public class LabSubCategoryService {

    private final LabSubCategoryRepository repository;
    private final LabCategoryRepository categoryRepository;
    private final LabComponentRepository componentRepository;

    public LabSubCategoryService(
            LabSubCategoryRepository repository,
            LabCategoryRepository categoryRepository,
            LabComponentRepository componentRepository) {
        this.repository = repository;
        this.categoryRepository = categoryRepository;
        this.componentRepository = componentRepository;
    }

    public List<LabSubCategoryDto> findAll() {
        return repository.findAllByOrderByOrderingNoAsc().stream().map(this::toDto).toList();
    }

    public List<LabSubCategoryDto> search(String query, Long categoryId) {
        String trimmed = query == null ? "" : query.trim();
        if (trimmed.isEmpty()) {
            return List.of();
        }
        return repository.search(trimmed, categoryId).stream().limit(20).map(this::toDto).toList();
    }

    @Transactional
    public LabSubCategoryDto create(LabSubCategoryDto dto) {
        LabCategory category = resolveCategory(dto.categoryId());
        if (repository.existsByCategoryIdAndNameIgnoreCase(category.getId(), dto.name())) {
            throw new IllegalArgumentException("Sub-category " + dto.name() + " already exists under " + category.getName());
        }
        LabSubCategory subCategory = new LabSubCategory();
        subCategory.setCategory(category);
        applyFields(subCategory, dto);
        return toDto(repository.save(subCategory));
    }

    @Transactional
    public LabSubCategoryDto update(Long id, LabSubCategoryDto dto) {
        LabSubCategory subCategory = getOrThrow(id);
        LabCategory category = resolveCategory(dto.categoryId());
        boolean changed = !subCategory.getCategory().getId().equals(category.getId())
                || !subCategory.getName().equalsIgnoreCase(dto.name());
        if (changed && repository.existsByCategoryIdAndNameIgnoreCase(category.getId(), dto.name())) {
            throw new IllegalArgumentException("Sub-category " + dto.name() + " already exists under " + category.getName());
        }
        subCategory.setCategory(category);
        applyFields(subCategory, dto);
        return toDto(repository.save(subCategory));
    }

    @Transactional
    public void delete(Long id) {
        LabSubCategory subCategory = getOrThrow(id);
        repository.delete(subCategory);
    }

    private LabCategory resolveCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Lab category not found: " + categoryId));
    }

    private void applyFields(LabSubCategory subCategory, LabSubCategoryDto dto) {
        subCategory.setName(dto.name().trim());
        subCategory.setOpAmount(dto.opAmount() != null ? dto.opAmount() : 0);
        subCategory.setIpAmount(dto.ipAmount() != null ? dto.ipAmount() : 0);
        subCategory.setNotes(dto.notes());
        subCategory.setOrderingNo(dto.orderingNo() != null ? dto.orderingNo() : 0);
        subCategory.setHeading(dto.heading());
    }

    private LabSubCategory getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Lab sub-category not found: " + id));
    }

    private LabSubCategoryDto toDto(LabSubCategory subCategory) {
        LabCategory category = subCategory.getCategory();
        return new LabSubCategoryDto(
                subCategory.getId(),
                category.getId(),
                category.getName(),
                subCategory.getName(),
                subCategory.getOpAmount(),
                subCategory.getIpAmount(),
                subCategory.getNotes(),
                subCategory.getOrderingNo(),
                subCategory.getHeading(),
                componentRepository.countBySubCategoryId(subCategory.getId()));
    }
}
