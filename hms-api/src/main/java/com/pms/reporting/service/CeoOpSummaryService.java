package com.pms.reporting.service;

import com.pms.registration.repository.AppointmentRepository;
import com.pms.reporting.dto.CeoOpSummaryDto;
import java.time.LocalDate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** CEO/MD Dashboard's OP Dashboard quadrant. */
@Service
@Transactional(readOnly = true)
public class CeoOpSummaryService {

    private final AppointmentRepository appointmentRepository;

    public CeoOpSummaryService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public CeoOpSummaryDto summary(LocalDate fromDate, LocalDate toDate) {
        AppointmentRepository.NewRepeatProjection projection = appointmentRepository.countNewVsRepeat(fromDate, toDate);
        long total = projection.getTotal();
        long newCount = projection.getNewCount();
        return new CeoOpSummaryDto(total, newCount, total - newCount);
    }
}
