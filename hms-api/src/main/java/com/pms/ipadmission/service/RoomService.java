package com.pms.ipadmission.service;

import com.pms.common.EntityNotFoundException;
import com.pms.ipadmission.dto.RoomDto;
import com.pms.ipadmission.entity.Room;
import com.pms.ipadmission.entity.RoomAuditLog;
import com.pms.ipadmission.entity.RoomStatus;
import com.pms.ipadmission.entity.RoomType;
import com.pms.ipadmission.repository.RoomAuditLogRepository;
import com.pms.ipadmission.repository.RoomRepository;
import com.pms.ipadmission.repository.RoomTypeRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Create/update/deactivate/restore/status-change are written to RoomAuditLog
 * (mirroring ConsultantService) so the Room Numbers screen can show who
 * created/deactivated each room.
 */
@Service
@Transactional(readOnly = true)
public class RoomService {

    private static final String CREATE = "CREATE";
    private static final String UPDATE = "UPDATE";
    private static final String DEACTIVATE = "DEACTIVATE";
    private static final String RESTORE = "RESTORE";
    private static final String STATUS_CHANGE = "STATUS_CHANGE";

    private final RoomRepository repository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomAuditLogRepository auditLogRepository;

    public RoomService(RoomRepository repository, RoomTypeRepository roomTypeRepository, RoomAuditLogRepository auditLogRepository) {
        this.repository = repository;
        this.roomTypeRepository = roomTypeRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public List<RoomDto> findActive() {
        return toDtos(repository.findByActiveTrueOrderByRoomNumberAsc());
    }

    public List<RoomDto> findInactive() {
        return toDtos(repository.findByActiveFalseOrderByUpdatedAtDesc());
    }

    @Transactional
    public RoomDto create(RoomDto dto) {
        requireUniqueRoomNumber(dto, null);
        Room room = new Room();
        applyFields(room, dto);
        room.setActive(true);
        room.setStatus(RoomStatus.AVAILABLE);
        Room saved = repository.save(room);
        recordAudit(saved, CREATE);
        return toDtos(List.of(saved)).get(0);
    }

    @Transactional
    public RoomDto update(Long id, RoomDto dto) {
        requireUniqueRoomNumber(dto, id);
        Room room = getOrThrow(id);
        applyFields(room, dto);
        Room saved = repository.save(room);
        recordAudit(saved, UPDATE);
        return toDtos(List.of(saved)).get(0);
    }

    @Transactional
    public void deactivate(Long id) {
        Room room = getOrThrow(id);
        room.setActive(false);
        repository.save(room);
        recordAudit(room, DEACTIVATE);
    }

    @Transactional
    public void restore(Long id) {
        Room room = getOrThrow(id);
        room.setActive(true);
        repository.save(room);
        recordAudit(room, RESTORE);
    }

    /**
     * Manual status change from the Room Availability screen. A room allocated
     * to an active admission may only be freed by AdmissionService's discharge
     * path (which mutates Room directly), not from this screen.
     */
    @Transactional
    public RoomDto updateStatus(Long id, RoomStatus newStatus) {
        Room room = getOrThrow(id);
        if (room.getStatus() == RoomStatus.ALLOCATED && newStatus != RoomStatus.ALLOCATED) {
            throw new IllegalArgumentException(
                    "Room " + room.getRoomNumber() + " is allocated to a patient - discharge the patient to free it");
        }
        room.setStatus(newStatus);
        Room saved = repository.save(room);
        recordAudit(saved, STATUS_CHANGE);
        return toDtos(List.of(saved)).get(0);
    }

    /**
     * A blank bedNumber keeps today's exact guarantee: roomNumber alone must
     * be globally unique. A bedNumber lets the same roomNumber repeat across
     * multiple beds (e.g. a General ward's room "101" catalogued as beds
     * "101"/A, "101"/B, "101"/C) - only that exact room+bed pair must be
     * unique. Existing rooms that never set a bedNumber are unaffected.
     */
    private void requireUniqueRoomNumber(RoomDto dto, Long excludingId) {
        boolean hasBedNumber = dto.bedNumber() != null && !dto.bedNumber().isBlank();
        boolean duplicate = hasBedNumber
                ? (excludingId == null
                        ? repository.existsByRoomNumberIgnoreCaseAndBedNumberIgnoreCase(dto.roomNumber(), dto.bedNumber())
                        : repository.existsByRoomNumberIgnoreCaseAndBedNumberIgnoreCaseAndIdNot(dto.roomNumber(), dto.bedNumber(), excludingId))
                : (excludingId == null
                        ? repository.existsByRoomNumberIgnoreCase(dto.roomNumber())
                        : repository.existsByRoomNumberIgnoreCaseAndIdNot(dto.roomNumber(), excludingId));
        if (duplicate) {
            String label = hasBedNumber ? dto.roomNumber() + " / bed " + dto.bedNumber() : dto.roomNumber();
            throw new IllegalArgumentException("Room already exists: " + label);
        }
    }

    private void applyFields(Room room, RoomDto dto) {
        RoomType roomType = roomTypeRepository.findById(dto.roomTypeId())
                .orElseThrow(() -> new EntityNotFoundException("Room type not found: " + dto.roomTypeId()));
        room.setRoomNumber(dto.roomNumber());
        room.setBedNumber(dto.bedNumber() != null && !dto.bedNumber().isBlank() ? dto.bedNumber() : null);
        room.setRoomType(roomType);
    }

    private void recordAudit(Room room, String operation) {
        auditLogRepository.save(new RoomAuditLog(room.getId(), room.getRoomNumber(), operation, currentUsername()));
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private List<RoomDto> toDtos(List<Room> rooms) {
        Map<Long, RoomAuditLog> createdBy = latestByRoom(CREATE);
        Map<Long, RoomAuditLog> updatedBy = latestByRoom(UPDATE);
        Map<Long, RoomAuditLog> deactivatedBy = latestByRoom(DEACTIVATE);
        return rooms.stream().map(room -> toDto(room, createdBy, updatedBy, deactivatedBy)).toList();
    }

    /** Most recent log per room for the given operation, keyed by room id. */
    private Map<Long, RoomAuditLog> latestByRoom(String operation) {
        return auditLogRepository.findAllByOperationOrderByPerformedAtDesc(operation).stream()
                .collect(HashMap::new, (map, log) -> map.putIfAbsent(log.getRoomId(), log), HashMap::putAll);
    }

    private Room getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Room not found: " + id));
    }

    private RoomDto toDto(Room room, Map<Long, RoomAuditLog> createdBy, Map<Long, RoomAuditLog> updatedBy, Map<Long, RoomAuditLog> deactivatedBy) {
        RoomAuditLog created = createdBy.get(room.getId());
        RoomAuditLog updated = updatedBy.get(room.getId());
        RoomAuditLog deactivated = room.isActive() ? null : deactivatedBy.get(room.getId());
        return new RoomDto(
                room.getId(),
                room.getRoomNumber(),
                room.getBedNumber(),
                room.getRoomType().getId(),
                room.getRoomType().getName(),
                room.getRoomType().getRentCash(),
                room.getStatus(),
                room.isActive(),
                room.getCreatedAt(),
                created != null ? created.getPerformedBy() : null,
                room.getUpdatedAt(),
                updated != null ? updated.getPerformedBy() : null,
                deactivated != null ? deactivated.getPerformedAt() : null,
                deactivated != null ? deactivated.getPerformedBy() : null);
    }
}
