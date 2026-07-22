package com.pms.website.service;

import com.pms.common.EntityNotFoundException;
import com.pms.settings.entity.ClinicSettings;
import com.pms.settings.repository.ClinicSettingsRepository;
import com.pms.website.dto.PublicConfigDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reads ClinicSettings directly (not through ClinicSettingsService, whose DTO
 * carries internal-only fields) so the public projection stays a narrow,
 * deliberate facade rather than an accidental superset.
 */
@Service
@Transactional(readOnly = true)
public class PublicConfigService {

    private final ClinicSettingsRepository repository;

    public PublicConfigService(ClinicSettingsRepository repository) {
        this.repository = repository;
    }

    public PublicConfigDto get() {
        ClinicSettings settings = repository.findById(ClinicSettings.SINGLETON_ID)
                .orElseThrow(() -> new EntityNotFoundException("Clinic settings not found"));
        return new PublicConfigDto(
                settings.getName(),
                settings.getLogoPath(),
                settings.getFaviconPath(),
                settings.isWebsiteEnabled(),
                settings.getDomain(),
                settings.getThemePrimaryColor(),
                settings.getThemeSecondaryColor(),
                settings.getSeoDefaultTitle(),
                settings.getSeoDefaultDescription(),
                settings.getSocialFacebookUrl(),
                settings.getSocialInstagramUrl(),
                settings.getSocialYoutubeUrl(),
                settings.getWhatsappNumber(),
                settings.getPhone(),
                settings.getEmail(),
                settings.getAddress(),
                settings.getThemeMode(),
                settings.getThemeTertiaryColor(),
                settings.getFontFamily(),
                settings.getCornerRadiusStyle(),
                settings.getHeaderBackgroundColor(),
                settings.getFooterBackgroundColor(),
                settings.getFooterText());
    }
}
