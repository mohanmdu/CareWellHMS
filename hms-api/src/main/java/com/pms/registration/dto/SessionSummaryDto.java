package com.pms.registration.dto;

import com.pms.masters.entity.Session;

public record SessionSummaryDto(Session session, boolean open, int availableCount, int bookedCount) {
}
