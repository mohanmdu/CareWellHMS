package com.pms.masters.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

// active is Boolean (not primitive) - create()/update() requests from the
// frontend omit this field entirely (the service sets it), and Jackson
// can't map a missing JSON property into a primitive record component.
public record OpBillingComponentDto(
        Long id,
        @NotNull Long categoryId,
        String categoryName,
        @NotBlank String name,
        @NotNull @Positive Double amount,
        Boolean active) {
}
