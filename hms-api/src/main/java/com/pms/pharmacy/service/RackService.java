package com.pms.pharmacy.service;

import com.pms.common.EntityNotFoundException;
import com.pms.pharmacy.dto.RackDto;
import com.pms.pharmacy.entity.Rack;
import com.pms.pharmacy.repository.RackRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RackService {

    private final RackRepository repository;

    public RackService(RackRepository repository) {
        this.repository = repository;
    }

    public List<RackDto> findActive() {
        return repository.findByActiveTrueOrderByNameAsc().stream().map(this::toDto).toList();
    }

    public List<RackDto> findInactive() {
        return repository.findByActiveFalseOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public RackDto create(RackDto dto) {
        if (repository.existsByNameIgnoreCase(dto.name())) {
            throw new IllegalArgumentException("Rack already exists: " + dto.name());
        }
        Rack rack = new Rack();
        rack.setName(dto.name());
        rack.setActive(true);
        return toDto(repository.save(rack));
    }

    @Transactional
    public RackDto update(Long id, RackDto dto) {
        Rack rack = getOrThrow(id);
        rack.setName(dto.name());
        return toDto(repository.save(rack));
    }

    @Transactional
    public void deactivate(Long id) {
        Rack rack = getOrThrow(id);
        rack.setActive(false);
        repository.save(rack);
    }

    @Transactional
    public void restore(Long id) {
        Rack rack = getOrThrow(id);
        rack.setActive(true);
        repository.save(rack);
    }

    private Rack getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Rack not found: " + id));
    }

    private RackDto toDto(Rack rack) {
        return new RackDto(rack.getId(), rack.getName(), rack.isActive());
    }
}
