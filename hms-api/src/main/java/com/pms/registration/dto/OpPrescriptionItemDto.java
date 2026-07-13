package com.pms.registration.dto;

public record OpPrescriptionItemDto(
        Long id,
        String drugName,
        Integer qty,
        String intake,
        Integer morningDose,
        Integer afternoonDose,
        Integer eveningDose,
        Integer nightDose) {
}
