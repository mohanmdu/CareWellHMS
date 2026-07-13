package com.pms.reporting.dto;

public record DashboardDto(
        long totalPatients,
        long activeAdmissions,
        long todaysAppointments,
        double totalOpRevenue,
        long pendingInsuranceClaims) {
}
