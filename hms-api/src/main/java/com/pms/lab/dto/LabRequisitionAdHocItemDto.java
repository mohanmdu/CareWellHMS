package com.pms.lab.dto;

import jakarta.validation.constraints.NotNull;

/** One ad-hoc billing line (Investigations flow), sourced from the OP Billing Catalog rather than a Lab Sub-Category. */
public record LabRequisitionAdHocItemDto(
        @NotNull Long componentId,
        @NotNull Double quantity,
        Double discount) {
}
