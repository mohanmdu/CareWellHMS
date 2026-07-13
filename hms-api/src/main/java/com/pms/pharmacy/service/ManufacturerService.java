package com.pms.pharmacy.service;

import com.pms.common.EntityNotFoundException;
import com.pms.pharmacy.dto.ManufacturerDto;
import com.pms.pharmacy.entity.Manufacturer;
import com.pms.pharmacy.repository.ManufacturerRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ManufacturerService {

    private final ManufacturerRepository repository;

    public ManufacturerService(ManufacturerRepository repository) {
        this.repository = repository;
    }

    public List<ManufacturerDto> findActive() {
        return repository.findByActiveTrueOrderByNameAsc().stream().map(this::toDto).toList();
    }

    public List<ManufacturerDto> findInactive() {
        return repository.findByActiveFalseOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public ManufacturerDto create(ManufacturerDto dto) {
        Manufacturer manufacturer = new Manufacturer();
        applyFields(manufacturer, dto);
        manufacturer.setActive(true);
        return toDto(repository.save(manufacturer));
    }

    @Transactional
    public ManufacturerDto update(Long id, ManufacturerDto dto) {
        Manufacturer manufacturer = getOrThrow(id);
        applyFields(manufacturer, dto);
        return toDto(repository.save(manufacturer));
    }

    @Transactional
    public void deactivate(Long id) {
        Manufacturer manufacturer = getOrThrow(id);
        manufacturer.setActive(false);
        repository.save(manufacturer);
    }

    @Transactional
    public void restore(Long id) {
        Manufacturer manufacturer = getOrThrow(id);
        manufacturer.setActive(true);
        repository.save(manufacturer);
    }

    private void applyFields(Manufacturer manufacturer, ManufacturerDto dto) {
        manufacturer.setName(dto.name());
        manufacturer.setContactPersonName(dto.contactPersonName());
        manufacturer.setPhoneNumber(dto.phoneNumber());
        manufacturer.setAddress(dto.address());
        manufacturer.setCity(dto.city());
        manufacturer.setState(dto.state());
    }

    private Manufacturer getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Manufacturer not found: " + id));
    }

    private ManufacturerDto toDto(Manufacturer manufacturer) {
        return new ManufacturerDto(
                manufacturer.getId(),
                manufacturer.getName(),
                manufacturer.getContactPersonName(),
                manufacturer.getPhoneNumber(),
                manufacturer.getAddress(),
                manufacturer.getCity(),
                manufacturer.getState(),
                manufacturer.isActive());
    }
}
