package com.pms.ipadmission.repository;

import com.pms.ipadmission.entity.Room;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByActiveTrueOrderByRoomNumberAsc();

    List<Room> findByActiveFalseOrderByUpdatedAtDesc();

    long countByRoomTypeId(Long roomTypeId);

    boolean existsByRoomNumberIgnoreCase(String roomNumber);

    boolean existsByRoomNumberIgnoreCaseAndIdNot(String roomNumber, Long id);
}
