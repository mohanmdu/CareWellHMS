package com.pms.masters.repository;

import com.pms.masters.entity.IpBillingComponent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IpBillingComponentRepository extends JpaRepository<IpBillingComponent, Long> {
    List<IpBillingComponent> findByActiveTrueOrderByNameAsc();

    List<IpBillingComponent> findByActiveFalseOrderByUpdatedAtDesc();
}
