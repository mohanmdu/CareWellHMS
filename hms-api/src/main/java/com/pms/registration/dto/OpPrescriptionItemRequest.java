package com.pms.registration.dto;

import jakarta.validation.constraints.NotBlank;

public record OpPrescriptionItemRequest(
        @NotBlank String drugName,
        Integer qty,
        String intake,
        Integer morningDose,
        Integer afternoonDose,
        Integer eveningDose,
        Integer nightDose) {
}
