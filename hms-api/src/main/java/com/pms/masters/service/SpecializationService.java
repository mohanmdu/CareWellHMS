package com.pms.masters.service;

import com.pms.common.EntityNotFoundException;
import com.pms.masters.dto.SpecializationDto;
import com.pms.masters.entity.Specialization;
import com.pms.masters.repository.SpecializationRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SpecializationService {

    private final SpecializationRepository repository;

    public SpecializationService(SpecializationRepository repository) {
        this.repository = repository;
    }

    public List<SpecializationDto> findAll() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    public SpecializationDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    @Transactional
    public SpecializationDto create(SpecializationDto dto) {
        if (repository.existsByNameIgnoreCase(dto.name())) {
            throw new IllegalArgumentException("Specialization already exists: " + dto.name());
        }
        Specialization specialization = new Specialization();
        specialization.setName(dto.name());
        specialization.setActive(true);
        return toDto(repository.save(specialization));
    }

    @Transactional
    public SpecializationDto update(Long id, SpecializationDto dto) {
        Specialization specialization = getOrThrow(id);
        specialization.setName(dto.name());
        return toDto(repository.save(specialization));
    }

    @Transactional
    public void deactivate(Long id) {
        Specialization specialization = getOrThrow(id);
        specialization.setActive(false);
        repository.save(specialization);
    }

    private Specialization getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Specialization not found: " + id));
    }

    private SpecializationDto toDto(Specialization specialization) {
        return new SpecializationDto(specialization.getId(), specialization.getName(), specialization.isActive());
    }
}
