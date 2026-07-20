package com.pms.lab.dto;

import java.time.LocalDateTime;
import java.util.List;

public record LabRequisitionDto(
        Long id,
        String requisitionNumber,
        String requisitionType,
        Long patientId,
        String patientUhid,
        String patientName,
        Integer age,
        String gender,
        String patientRegType,
        String patientType,
        String billingType,
        Long consultantId,
        String consultantName,
        double totalAmount,
        String status,
        LocalDateTime requisitionDate,
        String createdBy,
        Long invoiceNumber,
        Double paidAmount,
        Double discountAmount,
        String paymentMode,
        String remarks,
        List<LabRequisitionItemDto> items) {
}
