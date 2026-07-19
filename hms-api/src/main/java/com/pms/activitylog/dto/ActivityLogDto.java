package com.pms.activitylog.dto;

import java.time.Instant;

/** One row of the IP/OP Billing Activity Log ("IP/OP Tracking Report"). */
public record ActivityLogDto(
        Long id,
        String patientUhid,
        String patientName,
        String opNumber,
        String ipNumber,
        String module,
        String screenName,
        String operation,
        String content,
        String previousContent,
        String performedBy,
        Instant performedAt,
        String status,
        String remarks) {
}
