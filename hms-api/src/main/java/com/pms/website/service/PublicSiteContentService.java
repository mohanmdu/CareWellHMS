package com.pms.website.service;

import com.pms.cms.entity.CmsSiteContent;
import com.pms.cms.repository.CmsSiteContentRepository;
import com.pms.common.EntityNotFoundException;
import com.pms.website.dto.PublicSiteContentDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reads CmsSiteContentRepository directly (not through CmsSiteContentService)
 * so the public projection stays a narrow, deliberate facade, same idiom as
 * PublicConfigService/PublicDepartmentService.
 */
@Service
@Transactional(readOnly = true)
public class PublicSiteContentService {

    private final CmsSiteContentRepository repository;

    public PublicSiteContentService(CmsSiteContentRepository repository) {
        this.repository = repository;
    }

    public PublicSiteContentDto get() {
        CmsSiteContent content = repository.findById(CmsSiteContent.SINGLETON_ID)
                .orElseThrow(() -> new EntityNotFoundException("Site content not found"));
        return new PublicSiteContentDto(
                content.getAboutUsBody(),
                content.getMissionBody(),
                content.getVisionBody(),
                content.getHomeIntroTitle(),
                content.getHomeIntroBody());
    }
}
