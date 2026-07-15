package com.pms.pharmacy.dto;

import jakarta.validation.constraints.NotBlank;

// active is Boolean (not primitive) - create()/update() requests from the
// frontend omit this field entirely (the service sets it), and Jackson
// can't map a missing JSON property into a primitive record component.
public record PharmacyLocationDto(Long id, @NotBlank String name, Boolean active) {
}
