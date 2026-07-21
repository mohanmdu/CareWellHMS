package com.pms.insurance.repository;

import com.pms.insurance.entity.InsuranceCompany;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InsuranceCompanyRepository extends JpaRepository<InsuranceCompany, Long> {
    boolean existsByCompanyNameIgnoreCase(String companyName);

    List<InsuranceCompany> findByActiveTrueOrderByCompanyNameAsc();

    List<InsuranceCompany> findByActiveFalseOrderByUpdatedAtDesc();
}
