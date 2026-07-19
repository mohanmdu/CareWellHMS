package com.pms.website.service;

import com.pms.cms.entity.CmsCareerOpening;
import com.pms.cms.repository.CmsCareerOpeningRepository;
import com.pms.masters.entity.Department;
import com.pms.website.dto.PublicCareerOpeningDto;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reads CmsCareerOpeningRepository directly (not through
 * CmsCareerOpeningService) so the public projection stays a narrow,
 * deliberate facade, same idiom as PublicConfigService/PublicDepartmentService.
 */
@Service
@Transactional(readOnly = true)
public class PublicCareerOpeningService {

    private final CmsCareerOpeningRepository repository;

    public PublicCareerOpeningService(CmsCareerOpeningRepository repository) {
        this.repository = repository;
    }

    public List<PublicCareerOpeningDto> list() {
        return repository.findByActiveTrueOrderByCreatedAtDesc().stream().map(this::toDto).toList();
    }

    private PublicCareerOpeningDto toDto(CmsCareerOpening opening) {
        Department department = opening.getDepartment();
        return new PublicCareerOpeningDto(
                opening.getId(),
                opening.getTitle(),
                department != null ? department.getId() : null,
                department != null ? department.getName() : null,
                opening.getDescription(),
                opening.getApplyEmail());
    }
}
