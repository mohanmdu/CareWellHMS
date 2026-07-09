package com.pms.registration.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record PatientDto(
        Long id,
        String registrationNumber,
        @NotBlank String firstName,
        String lastName,
        LocalDate dateOfBirth,
        String gender,
        @NotBlank String mobileNumber,
        String email,
        String address) {
}
