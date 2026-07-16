package com.pms.settings.service;

import com.pms.common.EntityNotFoundException;
import com.pms.common.FileStorageService;
import com.pms.settings.dto.ClinicSettingsDto;
import com.pms.settings.entity.ClinicSettings;
import com.pms.settings.repository.ClinicSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional(readOnly = true)
public class ClinicSettingsService {

    private final ClinicSettingsRepository repository;
    private final FileStorageService fileStorageService;

    public ClinicSettingsService(ClinicSettingsRepository repository, FileStorageService fileStorageService) {
        this.repository = repository;
        this.fileStorageService = fileStorageService;
    }

    public ClinicSettingsDto get() {
        return toDto(getOrThrow());
    }

    @Transactional
    public ClinicSettingsDto update(ClinicSettingsDto dto) {
        ClinicSettings settings = getOrThrow();
        settings.setName(dto.name());
        settings.setAddress(dto.address());
        settings.setPhone(dto.phone());
        settings.setEmail(dto.email());
        settings.setTinNo(dto.tinNo());
        settings.setDlNo(dto.dlNo());
        return toDto(repository.save(settings));
    }

    @Transactional
    public ClinicSettingsDto uploadLogo(MultipartFile file) {
        ClinicSettings settings = getOrThrow();
        settings.setLogoPath(fileStorageService.store(file, "clinic"));
        return toDto(repository.save(settings));
    }

    private ClinicSettings getOrThrow() {
        return repository.findById(ClinicSettings.SINGLETON_ID)
                .orElseThrow(() -> new EntityNotFoundException("Clinic settings not found"));
    }

    private ClinicSettingsDto toDto(ClinicSettings settings) {
        return new ClinicSettingsDto(
                settings.getName(), settings.getAddress(), settings.getPhone(), settings.getEmail(), settings.getLogoPath(),
                settings.getTinNo(), settings.getDlNo());
    }
}
