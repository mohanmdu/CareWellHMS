package com.pms.masters.repository;

import com.pms.masters.entity.GeneralUser;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GeneralUserRepository extends JpaRepository<GeneralUser, Long> {
    List<GeneralUser> findByActiveTrueOrderByIdAsc();

    List<GeneralUser> findByActiveFalseOrderByUpdatedAtDesc();
}
