package com.pms.ipbilling.repository;

import com.pms.ipbilling.entity.IpBillingLineItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IpBillingLineItemRepository extends JpaRepository<IpBillingLineItem, Long> {
    List<IpBillingLineItem> findByAdmissionIdOrderByRequestedOnAsc(Long admissionId);
}
