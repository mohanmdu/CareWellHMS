package com.pms.pharmacy.service;

import com.pms.common.EntityNotFoundException;
import com.pms.pharmacy.dto.DrugDto;
import com.pms.pharmacy.entity.Drug;
import com.pms.pharmacy.repository.DrugRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DrugService {

    private final DrugRepository repository;

    public DrugService(DrugRepository repository) {
        this.repository = repository;
    }

    public List<DrugDto> findAll() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public DrugDto create(DrugDto dto) {
        if (repository.existsByNameIgnoreCase(dto.name())) {
            throw new IllegalArgumentException("Drug already exists: " + dto.name());
        }
        Drug drug = new Drug();
        drug.setName(dto.name());
        drug.setGenericName(dto.genericName());
        drug.setManufacturer(dto.manufacturer());
        drug.setUnitOfMeasure(dto.unitOfMeasure());
        drug.setActive(true);
        return toDto(repository.save(drug));
    }

    @Transactional
    public void deactivate(Long id) {
        Drug drug = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Drug not found: " + id));
        drug.setActive(false);
        repository.save(drug);
    }

    private DrugDto toDto(Drug drug) {
        return new DrugDto(drug.getId(), drug.getName(), drug.getGenericName(), drug.getManufacturer(), drug.getUnitOfMeasure(), drug.isActive());
    }
}
