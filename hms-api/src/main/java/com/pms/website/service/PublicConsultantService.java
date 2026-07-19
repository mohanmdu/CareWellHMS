package com.pms.website.service;

import com.pms.common.EntityNotFoundException;
import com.pms.masters.entity.Consultant;
import com.pms.masters.entity.Specialization;
import com.pms.masters.repository.ConsultantRepository;
import com.pms.website.dto.PublicConsultantDto;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reads ConsultantRepository directly (not through ConsultantService, whose
 * DTO carries email/mobileNumber/address and audit attribution), same
 * narrow-projection idiom as PublicConfigService/PublicDepartmentService.
 */
@Service
@Transactional(readOnly = true)
public class PublicConsultantService {

    private final ConsultantRepository repository;

    public PublicConsultantService(ConsultantRepository repository) {
        this.repository = repository;
    }

    public List<PublicConsultantDto> list(Long departmentId) {
        return repository.findByActiveTrueAndPublishedToWebTrueOrderByNameAsc().stream()
                .filter(consultant -> departmentId == null || departmentId.equals(consultant.getDepartment().getId()))
                .map(this::toDto)
                .toList();
    }

    public PublicConsultantDto get(Long id) {
        Consultant consultant = repository.findById(id)
                .filter(Consultant::isActive)
                .filter(Consultant::isPublishedToWeb)
                .orElseThrow(() -> new EntityNotFoundException("Consultant not found: " + id));
        return toDto(consultant);
    }

    private PublicConsultantDto toDto(Consultant consultant) {
        Specialization specialization = consultant.getSpecialization();
        return new PublicConsultantDto(
                consultant.getId(),
                consultant.getName(),
                consultant.getDepartment().getId(),
                consultant.getDepartment().getName(),
                specialization != null ? specialization.getName() : null,
                consultant.getProfile(),
                consultant.getConsultationFee(),
                consultant.getImagePath());
    }
}
