package com.pms.billing.dto;

import com.pms.billing.entity.InvoiceStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record InvoiceDto(
        Long id,
        String invoiceNumber,
        @NotNull Long patientId,
        String patientName,
        Long appointmentId,
        InvoiceStatus status,
        Double totalAmount,
        String cancellationReason,
        @NotEmpty @Valid List<InvoiceLineItemDto> lineItems) {
}
