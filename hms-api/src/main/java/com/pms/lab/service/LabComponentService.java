package com.pms.lab.service;

import com.pms.common.EntityNotFoundException;
import com.pms.lab.dto.LabComponentDto;
import com.pms.lab.entity.LabComponent;
import com.pms.lab.entity.LabSubCategory;
import com.pms.lab.repository.LabComponentRepository;
import com.pms.lab.repository.LabSubCategoryRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Lab Component: leaf of the master hierarchy, one measurable test parameter under a LabSubCategory. */
@Service
@Transactional(readOnly = true)
public class LabComponentService {

    private final LabComponentRepository repository;
    private final LabSubCategoryRepository subCategoryRepository;

    public LabComponentService(LabComponentRepository repository, LabSubCategoryRepository subCategoryRepository) {
        this.repository = repository;
        this.subCategoryRepository = subCategoryRepository;
    }

    public List<LabComponentDto> findAll() {
        return repository.findAllByOrderByOrderingNoAsc().stream().map(this::toDto).toList();
    }

    @Transactional
    public LabComponentDto create(LabComponentDto dto) {
        LabSubCategory subCategory = resolveSubCategory(dto.subCategoryId());
        LabComponent component = new LabComponent();
        component.setSubCategory(subCategory);
        applyFields(component, dto);
        return toDto(repository.save(component));
    }

    @Transactional
    public LabComponentDto update(Long id, LabComponentDto dto) {
        LabComponent component = getOrThrow(id);
        component.setSubCategory(resolveSubCategory(dto.subCategoryId()));
        applyFields(component, dto);
        return toDto(repository.save(component));
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private LabSubCategory resolveSubCategory(Long subCategoryId) {
        return subCategoryRepository.findById(subCategoryId)
                .orElseThrow(() -> new EntityNotFoundException("Lab sub-category not found: " + subCategoryId));
    }

    private void applyFields(LabComponent component, LabComponentDto dto) {
        component.setName(dto.name().trim());
        component.setFieldType(dto.fieldType());
        component.setSampleType(dto.sampleType());
        component.setMethod(dto.method());
        component.setMaleRangeFrom(dto.maleRangeFrom());
        component.setMaleRangeTo(dto.maleRangeTo());
        component.setFemaleRangeFrom(dto.femaleRangeFrom());
        component.setFemaleRangeTo(dto.femaleRangeTo());
        component.setNormalRange(dto.normalRange());
        component.setUnits(dto.units());
        component.setOrderingNo(dto.orderingNo() != null ? dto.orderingNo() : 0);
        component.setComponentHeading(dto.componentHeading());
        component.setConventionalFactor(dto.conventionalFactor());
        component.setSiUnit(dto.siUnit());
    }

    private LabComponent getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Lab component not found: " + id));
    }

    private LabComponentDto toDto(LabComponent component) {
        LabSubCategory subCategory = component.getSubCategory();
        return new LabComponentDto(
                component.getId(),
                subCategory.getId(),
                subCategory.getName(),
                subCategory.getCategory().getId(),
                subCategory.getCategory().getName(),
                component.getName(),
                component.getFieldType(),
                component.getSampleType(),
                component.getMethod(),
                component.getMaleRangeFrom(),
                component.getMaleRangeTo(),
                component.getFemaleRangeFrom(),
                component.getFemaleRangeTo(),
                component.getNormalRange(),
                component.getUnits(),
                component.getOrderingNo(),
                component.getComponentHeading(),
                component.getConventionalFactor(),
                component.getSiUnit());
    }
}
