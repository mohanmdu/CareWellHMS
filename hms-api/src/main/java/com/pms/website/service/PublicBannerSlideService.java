package com.pms.website.service;

import com.pms.cms.repository.CmsBannerSlideRepository;
import com.pms.website.dto.PublicBannerSlideDto;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reads CmsBannerSlideRepository directly (not through CmsBannerSlideService)
 * so the public projection stays a narrow, deliberate facade, same idiom as
 * PublicConfigService/PublicDepartmentService.
 */
@Service
@Transactional(readOnly = true)
public class PublicBannerSlideService {

    private final CmsBannerSlideRepository repository;

    public PublicBannerSlideService(CmsBannerSlideRepository repository) {
        this.repository = repository;
    }

    public List<PublicBannerSlideDto> list() {
        return repository.findByActiveTrueOrderBySortOrderAscTitleAsc().stream()
                .map(slide -> new PublicBannerSlideDto(
                        slide.getId(),
                        slide.getTitle(),
                        slide.getSubtitle(),
                        slide.getImagePath(),
                        slide.getLinkUrl(),
                        slide.getSortOrder()))
                .toList();
    }
}
