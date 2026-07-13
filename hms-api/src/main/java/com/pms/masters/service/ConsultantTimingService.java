package com.pms.masters.service;

import com.pms.common.EntityNotFoundException;
import com.pms.masters.dto.ConsultantAvailabilityDto;
import com.pms.masters.dto.ConsultantTimingDto;
import com.pms.masters.entity.Consultant;
import com.pms.masters.entity.ConsultantTiming;
import com.pms.masters.repository.ConsultantRepository;
import com.pms.masters.repository.ConsultantTimingRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Backs the "Update Timings" action (also shown inline on the Add/Edit
 * Consultant form when Appointment Status is Yes) - a consultant's weekly
 * working hours, up to one row per day/session (morning/afternoon/evening),
 * plus a slots-per-hour setting stored on the Consultant itself. Save
 * replaces the whole set for that consultant rather than patching individual
 * rows, matching how the form submits the full week at once.
 */
@Service
@Transactional(readOnly = true)
public class ConsultantTimingService {

    private final ConsultantTimingRepository repository;
    private final ConsultantRepository consultantRepository;

    public ConsultantTimingService(ConsultantTimingRepository repository, ConsultantRepository consultantRepository) {
        this.repository = repository;
        this.consultantRepository = consultantRepository;
    }

    public ConsultantAvailabilityDto findByConsultant(Long consultantId) {
        Consultant consultant = getOrThrow(consultantId);
        List<ConsultantTimingDto> timings = repository.findByConsultantIdOrderByDayOfWeekAscSessionAsc(consultantId)
                .stream()
                .map(this::toDto)
                .toList();
        return new ConsultantAvailabilityDto(consultant.getSlotsPerHour(), timings);
    }

    @Transactional
    public ConsultantAvailabilityDto replace(Long consultantId, ConsultantAvailabilityDto availability) {
        Consultant consultant = getOrThrow(consultantId);
        for (ConsultantTimingDto timing : availability.timings()) {
            if (!timing.session().isValidRange(timing.startTime(), timing.endTime())) {
                throw new IllegalArgumentException(
                        timing.session() + " must be between " + timing.session().rangeStart() + " and "
                                + timing.session().rangeEnd() + (timing.session().wrapsMidnight() ? " (next day)" : "")
                                + " for " + timing.dayOfWeek());
            }
        }
        consultant.setSlotsPerHour(availability.slotsPerHour());
        consultantRepository.save(consultant);

        repository.deleteByConsultantId(consultantId);
        repository.flush();
        availability.timings().forEach(dto -> {
            ConsultantTiming entity = new ConsultantTiming();
            entity.setConsultant(consultant);
            entity.setDayOfWeek(dto.dayOfWeek());
            entity.setSession(dto.session());
            entity.setStartTime(dto.startTime());
            entity.setEndTime(dto.endTime());
            repository.save(entity);
        });

        return findByConsultant(consultantId);
    }

    private Consultant getOrThrow(Long consultantId) {
        return consultantRepository.findById(consultantId)
                .orElseThrow(() -> new EntityNotFoundException("Consultant not found: " + consultantId));
    }

    private ConsultantTimingDto toDto(ConsultantTiming timing) {
        return new ConsultantTimingDto(timing.getDayOfWeek(), timing.getSession(), timing.getStartTime(), timing.getEndTime());
    }
}
