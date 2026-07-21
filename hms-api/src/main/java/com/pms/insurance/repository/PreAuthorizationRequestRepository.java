package com.pms.insurance.repository;

import com.pms.insurance.entity.PreAuthorizationRequest;
import com.pms.insurance.entity.PreAuthorizationStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PreAuthorizationRequestRepository extends JpaRepository<PreAuthorizationRequest, Long> {
    List<PreAuthorizationRequest> findByStatus(PreAuthorizationStatus status);

    List<PreAuthorizationRequest> findAllByOrderByIdDesc();
}
