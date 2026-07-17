package com.pms.masters.dto;

import java.time.Instant;

public record IpBillingActivityLogDto(
        Long id,
        Long componentId,
        String componentName,
        String operation,
        String content,
        String previousContent,
        String performedBy,
        Instant performedAt) {
}
