package com.pms.website.service;

import com.pms.cms.repository.CmsHealthPackageRepository;
import com.pms.website.dto.PublicHealthPackageDto;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reads CmsHealthPackageRepository directly (not through
 * CmsHealthPackageService) so the public projection stays a narrow,
 * deliberate facade, same idiom as PublicConfigService/PublicDepartmentService.
 */
@Service
@Transactional(readOnly = true)
public class PublicHealthPackageService {

    private final CmsHealthPackageRepository repository;

    public PublicHealthPackageService(CmsHealthPackageRepository repository) {
        this.repository = repository;
    }

    public List<PublicHealthPackageDto> list() {
        return repository.findByActiveTrueOrderByNameAsc().stream()
                .map(pkg -> new PublicHealthPackageDto(pkg.getId(), pkg.getName(), pkg.getDescription(), pkg.getPrice(), pkg.getIncludes()))
                .toList();
    }
}
