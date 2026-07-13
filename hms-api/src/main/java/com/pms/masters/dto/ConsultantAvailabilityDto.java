package com.pms.masters.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ConsultantAvailabilityDto(
        @NotNull @Min(1) @Max(12) Integer slotsPerHour, @NotNull List<ConsultantTimingDto> timings) {
}
