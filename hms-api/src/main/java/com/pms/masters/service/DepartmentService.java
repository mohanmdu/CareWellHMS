package com.pms.masters.service;

import com.pms.common.EntityNotFoundException;
import com.pms.masters.dto.DepartmentDto;
import com.pms.masters.entity.Department;
import com.pms.masters.repository.DepartmentRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Replaces AdminAction.getDepartmentDetails / addDepartment / deptEditDetails /
 * deptUpdateDetails / deptDeactivateDetails (see migration doc §4.6 / §5).
 */
@Service
@Transactional(readOnly = true)
public class DepartmentService {

    private final DepartmentRepository repository;

    public DepartmentService(DepartmentRepository repository) {
        this.repository = repository;
    }

    public List<DepartmentDto> findAll() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    public DepartmentDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    @Transactional
    public DepartmentDto create(DepartmentDto dto) {
        if (repository.existsByNameIgnoreCase(dto.name())) {
            throw new IllegalArgumentException("Department already exists: " + dto.name());
        }
        Department department = new Department();
        department.setName(dto.name());
        department.setActive(true);
        return toDto(repository.save(department));
    }

    @Transactional
    public DepartmentDto update(Long id, DepartmentDto dto) {
        Department department = getOrThrow(id);
        department.setName(dto.name());
        return toDto(repository.save(department));
    }

    @Transactional
    public void deactivate(Long id) {
        Department department = getOrThrow(id);
        department.setActive(false);
        repository.save(department);
    }

    private Department getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Department not found: " + id));
    }

    private DepartmentDto toDto(Department department) {
        return new DepartmentDto(department.getId(), department.getName(), department.isActive());
    }
}
