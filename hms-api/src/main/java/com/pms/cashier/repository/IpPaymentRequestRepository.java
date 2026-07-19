package com.pms.cashier.repository;

import com.pms.cashier.entity.IpPaymentRequest;
import com.pms.cashier.entity.PaymentRequestStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IpPaymentRequestRepository extends JpaRepository<IpPaymentRequest, Long> {
    List<IpPaymentRequest> findByStatusOrderByRequestedAtDesc(PaymentRequestStatus status);

    long countByStatus(PaymentRequestStatus status);
}
