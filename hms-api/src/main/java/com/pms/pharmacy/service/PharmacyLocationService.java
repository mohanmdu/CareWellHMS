package com.pms.pharmacy.service;

import com.pms.common.EntityNotFoundException;
import com.pms.pharmacy.dto.PharmacyLocationDto;
import com.pms.pharmacy.entity.PharmacyLocation;
import com.pms.pharmacy.repository.PharmacyLocationRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PharmacyLocationService {

    private final PharmacyLocationRepository repository;

    public PharmacyLocationService(PharmacyLocationRepository repository) {
        this.repository = repository;
    }

    public List<PharmacyLocationDto> findActive() {
        return repository.findByActiveTrueOrderByNameAsc().stream().map(this::toDto).toList();
    }

    public List<PharmacyLocationDto> findInactive() {
        return repository.findByActiveFalseOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public PharmacyLocationDto create(PharmacyLocationDto dto) {
        if (repository.existsByNameIgnoreCase(dto.name())) {
            throw new IllegalArgumentException("Pharmacy Location already exists: " + dto.name());
        }
        PharmacyLocation location = new PharmacyLocation();
        location.setName(dto.name());
        location.setActive(true);
        return toDto(repository.save(location));
    }

    @Transactional
    public PharmacyLocationDto update(Long id, PharmacyLocationDto dto) {
        PharmacyLocation location = getOrThrow(id);
        location.setName(dto.name());
        return toDto(repository.save(location));
    }

    @Transactional
    public void deactivate(Long id) {
        PharmacyLocation location = getOrThrow(id);
        location.setActive(false);
        repository.save(location);
    }

    @Transactional
    public void restore(Long id) {
        PharmacyLocation location = getOrThrow(id);
        location.setActive(true);
        repository.save(location);
    }

    private PharmacyLocation getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pharmacy Location not found: " + id));
    }

    private PharmacyLocationDto toDto(PharmacyLocation location) {
        return new PharmacyLocationDto(location.getId(), location.getName(), location.isActive());
    }
}
