package com.pms.ipbilling.repository;

import com.pms.ipbilling.entity.IpPayment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IpPaymentRepository extends JpaRepository<IpPayment, Long> {
    List<IpPayment> findByAdmissionIdOrderByPaymentDateDesc(Long admissionId);

    long countByAdmissionId(Long admissionId);
}
