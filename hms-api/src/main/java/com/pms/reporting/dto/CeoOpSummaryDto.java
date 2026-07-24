package com.pms.reporting.dto;

/** CEO/MD Dashboard's OP Dashboard quadrant. "New" = the patient's chronologically first-ever appointment - see CeoOpSummaryService. */
public record CeoOpSummaryDto(long totalAppointments, long newAppointments, long repeatAppointments) {
}
