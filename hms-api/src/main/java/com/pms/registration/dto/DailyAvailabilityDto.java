package com.pms.registration.dto;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

public record DailyAvailabilityDto(LocalDate date, DayOfWeek dayOfWeek, List<SessionSummaryDto> sessions) {
}
