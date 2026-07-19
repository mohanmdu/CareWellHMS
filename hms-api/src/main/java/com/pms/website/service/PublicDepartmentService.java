package com.pms.website.service;

import com.pms.masters.repository.DepartmentRepository;
import com.pms.website.dto.PublicDepartmentDto;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reads DepartmentRepository directly (not through DepartmentService, whose
 * DTO carries internal-only fields like consultantCount/audit attribution),
 * same narrow-projection idiom as PublicConfigService.
 */
@Service
@Transactional(readOnly = true)
public class PublicDepartmentService {

    private final DepartmentRepository repository;

    public PublicDepartmentService(DepartmentRepository repository) {
        this.repository = repository;
    }

    public List<PublicDepartmentDto> list() {
        return repository.findByActiveTrueAndPublishedToWebTrueOrderByNameAsc().stream()
                .map(department -> new PublicDepartmentDto(department.getId(), department.getName()))
                .toList();
    }
}
