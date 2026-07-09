package com.pms.ipadmission.service;

import com.pms.common.EntityNotFoundException;
import com.pms.ipadmission.dto.RoomDto;
import com.pms.ipadmission.entity.Room;
import com.pms.ipadmission.entity.RoomType;
import com.pms.ipadmission.repository.RoomRepository;
import com.pms.ipadmission.repository.RoomTypeRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RoomService {

    private final RoomRepository repository;
    private final RoomTypeRepository roomTypeRepository;

    public RoomService(RoomRepository repository, RoomTypeRepository roomTypeRepository) {
        this.repository = repository;
        this.roomTypeRepository = roomTypeRepository;
    }

    public List<RoomDto> findAll() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public RoomDto create(RoomDto dto) {
        RoomType roomType = roomTypeRepository.findById(dto.roomTypeId())
                .orElseThrow(() -> new EntityNotFoundException("Room type not found: " + dto.roomTypeId()));
        Room room = new Room();
        room.setRoomNumber(dto.roomNumber());
        room.setRoomType(roomType);
        room.setOccupied(false);
        return toDto(repository.save(room));
    }

    private RoomDto toDto(Room room) {
        return new RoomDto(room.getId(), room.getRoomNumber(), room.getRoomType().getId(), room.getRoomType().getName(), room.isOccupied());
    }
}
