package com.pms.registration.dto;

import java.time.LocalDate;
import java.util.List;

public record OpCaseSheetSaveRequest(
        String foodDrugAllergy,
        Double heightCm,
        Double weightKg,
        Double bmi,
        Double temperatureF,
        Integer pulseBpm,
        Integer respirationBpm,
        Integer bpSystolic,
        Integer bpDiastolic,
        Double spo2,
        Double bodyFatPercent,
        String chiefComplaints,
        String pastMedicalCondition,
        String currentMedication,
        String physicalActivity,
        String sleepDurationHours,
        String smoking,
        String alcohol,
        String surgery,
        String familyHistory,
        String provisionalDiagnosis,
        String cbg,
        String findings,
        String investigation,
        String doctorNotes1,
        String doctorNotes2,
        List<OpPrescriptionItemRequest> prescriptionItems,
        String diet,
        String remarks,
        LocalDate reviewDate) {
}
