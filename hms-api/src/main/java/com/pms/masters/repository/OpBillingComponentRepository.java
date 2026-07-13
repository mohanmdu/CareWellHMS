package com.pms.masters.repository;

import com.pms.masters.entity.OpBillingComponent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OpBillingComponentRepository extends JpaRepository<OpBillingComponent, Long> {
    List<OpBillingComponent> findByActiveTrueOrderByNameAsc();

    List<OpBillingComponent> findByActiveFalseOrderByUpdatedAtDesc();
}
