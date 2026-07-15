package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.Grn;
import com.pms.pharmacy.entity.GrnStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GrnRepository extends JpaRepository<Grn, Long> {
    List<Grn> findAllByOrderByCreatedAtDesc();

    List<Grn> findByStatusOrderByCreatedAtDesc(GrnStatus status);
}
