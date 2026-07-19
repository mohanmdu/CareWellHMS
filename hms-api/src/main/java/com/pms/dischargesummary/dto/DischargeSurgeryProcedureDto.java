package com.pms.dischargesummary.dto;

import java.time.LocalDate;

public record DischargeSurgeryProcedureDto(
        Long id,
        String procedureName,
        String surgeonName,
        String assistantSurgeonName,
        String anaesthetistName,
        LocalDate dateOfSurgery) {
}
