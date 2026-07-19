package com.pms.cms.service;

import com.pms.cms.dto.CmsHealthPackageDto;
import com.pms.cms.entity.CmsHealthPackage;
import com.pms.cms.repository.CmsHealthPackageRepository;
import com.pms.common.EntityNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CmsHealthPackageService {

    private final CmsHealthPackageRepository repository;

    public CmsHealthPackageService(CmsHealthPackageRepository repository) {
        this.repository = repository;
    }

    public List<CmsHealthPackageDto> findActive() {
        return repository.findByActiveTrueOrderByNameAsc().stream().map(this::toDto).toList();
    }

    public List<CmsHealthPackageDto> findInactive() {
        return repository.findByActiveFalseOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public CmsHealthPackageDto create(CmsHealthPackageDto dto) {
        CmsHealthPackage pkg = new CmsHealthPackage();
        applyFields(pkg, dto);
        pkg.setActive(true);
        return toDto(repository.save(pkg));
    }

    @Transactional
    public CmsHealthPackageDto update(Long id, CmsHealthPackageDto dto) {
        CmsHealthPackage pkg = getOrThrow(id);
        applyFields(pkg, dto);
        return toDto(repository.save(pkg));
    }

    @Transactional
    public void deactivate(Long id) {
        CmsHealthPackage pkg = getOrThrow(id);
        pkg.setActive(false);
        repository.save(pkg);
    }

    @Transactional
    public void restore(Long id) {
        CmsHealthPackage pkg = getOrThrow(id);
        pkg.setActive(true);
        repository.save(pkg);
    }

    private void applyFields(CmsHealthPackage pkg, CmsHealthPackageDto dto) {
        pkg.setName(dto.name());
        pkg.setDescription(dto.description());
        pkg.setPrice(dto.price() != null ? dto.price() : 0.0);
        pkg.setIncludes(dto.includes());
    }

    private CmsHealthPackage getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Health package not found: " + id));
    }

    private CmsHealthPackageDto toDto(CmsHealthPackage pkg) {
        return new CmsHealthPackageDto(pkg.getId(), pkg.getName(), pkg.getDescription(), pkg.getPrice(), pkg.getIncludes(), pkg.isActive());
    }
}
