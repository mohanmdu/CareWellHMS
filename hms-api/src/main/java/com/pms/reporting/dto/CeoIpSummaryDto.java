package com.pms.reporting.dto;

import java.time.Instant;

/** CEO/MD Dashboard's IP Dashboard quadrant. bedsTotal/bedsOccupied are a live snapshot (asOf), not date-filtered - see CeoIpSummaryService. */
public record CeoIpSummaryDto(long bedsTotal, long bedsOccupied, long patientsAdmitted, long patientsDischarged, Instant asOf) {
}
