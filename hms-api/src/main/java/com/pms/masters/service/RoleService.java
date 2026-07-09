package com.pms.masters.service;

import com.pms.common.EntityNotFoundException;
import com.pms.masters.dto.RoleDto;
import com.pms.masters.entity.Role;
import com.pms.masters.repository.RoleRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RoleService {

    private final RoleRepository repository;

    public RoleService(RoleRepository repository) {
        this.repository = repository;
    }

    public List<RoleDto> findAll() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    public RoleDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    @Transactional
    public RoleDto create(RoleDto dto) {
        if (repository.existsByNameIgnoreCase(dto.name())) {
            throw new IllegalArgumentException("Role already exists: " + dto.name());
        }
        Role role = new Role();
        role.setName(dto.name());
        role.setActive(true);
        return toDto(repository.save(role));
    }

    @Transactional
    public RoleDto update(Long id, RoleDto dto) {
        Role role = getOrThrow(id);
        role.setName(dto.name());
        return toDto(repository.save(role));
    }

    @Transactional
    public void deactivate(Long id) {
        Role role = getOrThrow(id);
        role.setActive(false);
        repository.save(role);
    }

    private Role getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Role not found: " + id));
    }

    private RoleDto toDto(Role role) {
        return new RoleDto(role.getId(), role.getName(), role.isActive());
    }
}
