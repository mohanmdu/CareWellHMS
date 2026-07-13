package com.pms.pharmacy.dto;

import com.pms.pharmacy.entity.MedicalCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// active is Boolean (not primitive) - create()/update() requests from the
// frontend omit this field entirely (the service sets it), and Jackson
// can't map a missing JSON property into a primitive record component.
public record ProductDto(
        Long id,
        @NotBlank String name,
        @NotNull Long productTypeId,
        String productTypeName,
        String productCategory,
        String drugDosage,
        String drugType,
        @NotNull Long rackId,
        String rackName,
        Long manufacturerId,
        String manufacturerName,
        @NotNull MedicalCategory medOrNonMed,
        Double centralGst,
        Double stateGst,
        String hsnSac,
        Boolean active) {
}
