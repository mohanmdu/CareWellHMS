package com.pms.masters.dto;

import java.time.Instant;

public record GeneralUserAuditLogDto(Long id, String operation, String userName, String performedBy, Instant performedAt) {
}
