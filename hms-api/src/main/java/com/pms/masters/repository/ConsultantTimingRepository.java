package com.pms.masters.repository;

import com.pms.masters.entity.ConsultantTiming;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsultantTimingRepository extends JpaRepository<ConsultantTiming, Long> {
    List<ConsultantTiming> findByConsultantIdOrderByDayOfWeekAscSessionAsc(Long consultantId);

    void deleteByConsultantId(Long consultantId);
}
