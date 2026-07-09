package com.pms.insurance.repository;

import com.pms.insurance.entity.InsuranceClaim;
import com.pms.insurance.entity.InsuranceClaimStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InsuranceClaimRepository extends JpaRepository<InsuranceClaim, Long> {
    List<InsuranceClaim> findByStatus(InsuranceClaimStatus status);
}
