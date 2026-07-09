package com.pms.ipadmission.service;

import com.pms.ipadmission.dto.RoomTypeDto;
import com.pms.ipadmission.entity.RoomType;
import com.pms.ipadmission.repository.RoomTypeRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RoomTypeService {

    private final RoomTypeRepository repository;

    public RoomTypeService(RoomTypeRepository repository) {
        this.repository = repository;
    }

    public List<RoomTypeDto> findAll() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public RoomTypeDto create(RoomTypeDto dto) {
        if (repository.existsByNameIgnoreCase(dto.name())) {
            throw new IllegalArgumentException("Room type already exists: " + dto.name());
        }
        RoomType roomType = new RoomType();
        roomType.setName(dto.name());
        roomType.setDailyRate(dto.dailyRate() != null ? dto.dailyRate() : 0.0);
        roomType.setActive(true);
        return toDto(repository.save(roomType));
    }

    private RoomTypeDto toDto(RoomType roomType) {
        return new RoomTypeDto(roomType.getId(), roomType.getName(), roomType.getDailyRate(), roomType.isActive());
    }
}
