package com.pms.pharmacy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

// active is Boolean (not primitive) - create()/update() requests from the
// frontend omit this field entirely (the service sets it), and Jackson
// can't map a missing JSON property into a primitive record component.
public record ManufacturerDto(
        Long id,
        @NotBlank String name,
        String contactPersonName,
        // optional (unlike Supplier's required mobileNumber) - @Pattern alone (no
        // @NotBlank) passes null/omitted values per Bean Validation semantics.
        @Pattern(regexp = "\\d{10}", message = "Phone number must be exactly 10 digits") String phoneNumber,
        @NotBlank String address,
        @NotBlank String city,
        @NotBlank String state,
        Boolean active) {
}
