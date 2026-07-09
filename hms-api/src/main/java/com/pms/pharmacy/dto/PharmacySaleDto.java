package com.pms.pharmacy.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record PharmacySaleDto(
        Long id,
        String saleNumber,
        @NotNull Long patientId,
        String patientName,
        Double totalAmount,
        @NotEmpty @Valid List<PharmacySaleItemDto> items) {
}
