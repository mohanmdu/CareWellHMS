package com.pms.cms.service;

import com.pms.cms.dto.CmsCareerOpeningDto;
import com.pms.cms.entity.CmsCareerOpening;
import com.pms.cms.repository.CmsCareerOpeningRepository;
import com.pms.common.EntityNotFoundException;
import com.pms.masters.entity.Department;
import com.pms.masters.repository.DepartmentRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CmsCareerOpeningService {

    private final CmsCareerOpeningRepository repository;
    private final DepartmentRepository departmentRepository;

    public CmsCareerOpeningService(CmsCareerOpeningRepository repository, DepartmentRepository departmentRepository) {
        this.repository = repository;
        this.departmentRepository = departmentRepository;
    }

    public List<CmsCareerOpeningDto> findActive() {
        return repository.findByActiveTrueOrderByCreatedAtDesc().stream().map(this::toDto).toList();
    }

    public List<CmsCareerOpeningDto> findInactive() {
        return repository.findByActiveFalseOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public CmsCareerOpeningDto create(CmsCareerOpeningDto dto) {
        CmsCareerOpening opening = new CmsCareerOpening();
        applyFields(opening, dto);
        opening.setActive(true);
        return toDto(repository.save(opening));
    }

    @Transactional
    public CmsCareerOpeningDto update(Long id, CmsCareerOpeningDto dto) {
        CmsCareerOpening opening = getOrThrow(id);
        applyFields(opening, dto);
        return toDto(repository.save(opening));
    }

    @Transactional
    public void deactivate(Long id) {
        CmsCareerOpening opening = getOrThrow(id);
        opening.setActive(false);
        repository.save(opening);
    }

    @Transactional
    public void restore(Long id) {
        CmsCareerOpening opening = getOrThrow(id);
        opening.setActive(true);
        repository.save(opening);
    }

    private void applyFields(CmsCareerOpening opening, CmsCareerOpeningDto dto) {
        opening.setTitle(dto.title());
        opening.setDepartment(resolveDepartment(dto.departmentId()));
        opening.setDescription(dto.description());
        opening.setApplyEmail(dto.applyEmail());
    }

    private Department resolveDepartment(Long departmentId) {
        if (departmentId == null) {
            return null;
        }
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new EntityNotFoundException("Department not found: " + departmentId));
    }

    private CmsCareerOpening getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Career opening not found: " + id));
    }

    private CmsCareerOpeningDto toDto(CmsCareerOpening opening) {
        Department department = opening.getDepartment();
        return new CmsCareerOpeningDto(
                opening.getId(),
                opening.getTitle(),
                department != null ? department.getId() : null,
                department != null ? department.getName() : null,
                opening.getDescription(),
                opening.getApplyEmail(),
                opening.isActive());
    }
}
