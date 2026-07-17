package com.pms.ipadmission.repository;

import com.pms.ipadmission.entity.RoomType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomTypeRepository extends JpaRepository<RoomType, Long> {
    boolean existsByNameIgnoreCase(String name);

    List<RoomType> findByActiveTrueOrderByNameAsc();

    List<RoomType> findByActiveFalseOrderByUpdatedAtDesc();
}
