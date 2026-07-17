package com.pms.pharmacy.dto;

import java.time.LocalDate;

public record PatientStatementItemDto(String type, String drugName, String batch, LocalDate expiryDate, Integer qty, Double mrp, Double netAmount) {
}
