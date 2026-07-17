package com.pms.ipadmission.service;

import com.pms.common.EntityNotFoundException;
import com.pms.ipadmission.dto.RoomTypeDto;
import com.pms.ipadmission.entity.RoomType;
import com.pms.ipadmission.entity.RoomTypeAuditLog;
import com.pms.ipadmission.repository.RoomRepository;
import com.pms.ipadmission.repository.RoomTypeAuditLogRepository;
import com.pms.ipadmission.repository.RoomTypeRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Create/update/deactivate/restore are written to RoomTypeAuditLog (mirroring
 * ConsultantService) so the Room Types screen can show who created/deactivated
 * each room type; roomCount is a live count of Room rows for that type.
 */
@Service
@Transactional(readOnly = true)
public class RoomTypeService {

    private static final String CREATE = "CREATE";
    private static final String UPDATE = "UPDATE";
    private static final String DEACTIVATE = "DEACTIVATE";
    private static final String RESTORE = "RESTORE";

    private final RoomTypeRepository repository;
    private final RoomRepository roomRepository;
    private final RoomTypeAuditLogRepository auditLogRepository;

    public RoomTypeService(
            RoomTypeRepository repository, RoomRepository roomRepository, RoomTypeAuditLogRepository auditLogRepository) {
        this.repository = repository;
        this.roomRepository = roomRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public List<RoomTypeDto> findActive() {
        return toDtos(repository.findByActiveTrueOrderByNameAsc());
    }

    public List<RoomTypeDto> findInactive() {
        return toDtos(repository.findByActiveFalseOrderByUpdatedAtDesc());
    }

    @Transactional
    public RoomTypeDto create(RoomTypeDto dto) {
        if (repository.existsByNameIgnoreCase(dto.name())) {
            throw new IllegalArgumentException("Room type already exists: " + dto.name());
        }
        RoomType roomType = new RoomType();
        applyFields(roomType, dto);
        roomType.setActive(true);
        RoomType saved = repository.save(roomType);
        recordAudit(saved, CREATE);
        return toDtos(List.of(saved)).get(0);
    }

    @Transactional
    public RoomTypeDto update(Long id, RoomTypeDto dto) {
        RoomType roomType = getOrThrow(id);
        applyFields(roomType, dto);
        RoomType saved = repository.save(roomType);
        recordAudit(saved, UPDATE);
        return toDtos(List.of(saved)).get(0);
    }

    @Transactional
    public void deactivate(Long id) {
        RoomType roomType = getOrThrow(id);
        roomType.setActive(false);
        repository.save(roomType);
        recordAudit(roomType, DEACTIVATE);
    }

    @Transactional
    public void restore(Long id) {
        RoomType roomType = getOrThrow(id);
        roomType.setActive(true);
        repository.save(roomType);
        recordAudit(roomType, RESTORE);
    }

    private void applyFields(RoomType roomType, RoomTypeDto dto) {
        roomType.setName(dto.name());
        roomType.setRentCash(dto.rentCash() != null ? dto.rentCash() : 0.0);
        roomType.setRentClaim(dto.rentClaim() != null ? dto.rentClaim() : 0.0);
    }

    private void recordAudit(RoomType roomType, String operation) {
        auditLogRepository.save(new RoomTypeAuditLog(roomType.getId(), roomType.getName(), operation, currentUsername()));
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private List<RoomTypeDto> toDtos(List<RoomType> roomTypes) {
        Map<Long, RoomTypeAuditLog> createdBy = latestByRoomType(CREATE);
        Map<Long, RoomTypeAuditLog> updatedBy = latestByRoomType(UPDATE);
        Map<Long, RoomTypeAuditLog> deactivatedBy = latestByRoomType(DEACTIVATE);
        return roomTypes.stream().map(roomType -> toDto(roomType, createdBy, updatedBy, deactivatedBy)).toList();
    }

    /** Most recent log per room type for the given operation, keyed by room type id. */
    private Map<Long, RoomTypeAuditLog> latestByRoomType(String operation) {
        return auditLogRepository.findAllByOperationOrderByPerformedAtDesc(operation).stream()
                .collect(HashMap::new, (map, log) -> map.putIfAbsent(log.getRoomTypeId(), log), HashMap::putAll);
    }

    private RoomType getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Room type not found: " + id));
    }

    private RoomTypeDto toDto(
            RoomType roomType,
            Map<Long, RoomTypeAuditLog> createdBy,
            Map<Long, RoomTypeAuditLog> updatedBy,
            Map<Long, RoomTypeAuditLog> deactivatedBy) {
        RoomTypeAuditLog created = createdBy.get(roomType.getId());
        RoomTypeAuditLog updated = updatedBy.get(roomType.getId());
        RoomTypeAuditLog deactivated = roomType.isActive() ? null : deactivatedBy.get(roomType.getId());
        return new RoomTypeDto(
                roomType.getId(),
                roomType.getName(),
                roomType.getRentCash(),
                roomType.getRentClaim(),
                roomType.isActive(),
                roomRepository.countByRoomTypeId(roomType.getId()),
                roomType.getCreatedAt(),
                created != null ? created.getPerformedBy() : null,
                roomType.getUpdatedAt(),
                updated != null ? updated.getPerformedBy() : null,
                deactivated != null ? deactivated.getPerformedAt() : null,
                deactivated != null ? deactivated.getPerformedBy() : null);
    }
}
