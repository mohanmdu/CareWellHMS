package com.pms.masters.dto;

import com.pms.masters.entity.Session;
import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.LocalTime;

public record ConsultantTimingDto(
        @NotNull DayOfWeek dayOfWeek, @NotNull Session session, @NotNull LocalTime startTime, @NotNull LocalTime endTime) {
}
