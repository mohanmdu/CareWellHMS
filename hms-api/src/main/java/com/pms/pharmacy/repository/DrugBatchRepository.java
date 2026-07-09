package com.pms.pharmacy.repository;

import com.pms.pharmacy.entity.DrugBatch;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DrugBatchRepository extends JpaRepository<DrugBatch, Long> {
    List<DrugBatch> findByDrugId(Long drugId);
}
