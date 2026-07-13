package com.pms.pharmacy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

// active is Boolean (not primitive) - create()/update() requests from the
// frontend omit this field entirely (the service sets it), and Jackson
// can't map a missing JSON property into a primitive record component.
public record SupplierDto(
        Long id,
        @NotBlank String name,
        String contactPersonName,
        @NotBlank @Pattern(regexp = "\\d{10}", message = "Mobile number must be exactly 10 digits") String mobileNumber,
        @NotBlank String address,
        String city,
        String landlineNumber,
        Boolean active) {
}
