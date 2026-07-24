package com.pms.ipadmission.repository;

import com.pms.ipadmission.entity.Room;
import com.pms.ipadmission.entity.RoomStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByActiveTrueOrderByRoomNumberAsc();

    List<Room> findByActiveFalseOrderByUpdatedAtDesc();

    long countByRoomTypeId(Long roomTypeId);

    // CEO/MD Dashboard bed occupancy - a real COUNT, not the fetch-all-and-filter-in-JS
    // pattern RoomAvailabilityComponent uses today.
    long countByActiveTrue();

    long countByStatusAndActiveTrue(RoomStatus status);

    boolean existsByRoomNumberIgnoreCase(String roomNumber);

    boolean existsByRoomNumberIgnoreCaseAndIdNot(String roomNumber, Long id);

    /** Used when bedNumber is provided - allows the same room_number to repeat across different beds. */
    boolean existsByRoomNumberIgnoreCaseAndBedNumberIgnoreCase(String roomNumber, String bedNumber);

    boolean existsByRoomNumberIgnoreCaseAndBedNumberIgnoreCaseAndIdNot(String roomNumber, String bedNumber, Long id);
}
