package com.pms.cms.service;

import com.pms.cms.dto.CmsSiteContentDto;
import com.pms.cms.entity.CmsSiteContent;
import com.pms.cms.repository.CmsSiteContentRepository;
import com.pms.common.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CmsSiteContentService {

    private final CmsSiteContentRepository repository;

    public CmsSiteContentService(CmsSiteContentRepository repository) {
        this.repository = repository;
    }

    public CmsSiteContentDto get() {
        return toDto(getOrThrow());
    }

    @Transactional
    public CmsSiteContentDto update(CmsSiteContentDto dto) {
        CmsSiteContent content = getOrThrow();
        content.setAboutUsBody(dto.aboutUsBody());
        content.setMissionBody(dto.missionBody());
        content.setVisionBody(dto.visionBody());
        content.setHomeIntroTitle(dto.homeIntroTitle());
        content.setHomeIntroBody(dto.homeIntroBody());
        return toDto(repository.save(content));
    }

    private CmsSiteContent getOrThrow() {
        return repository.findById(CmsSiteContent.SINGLETON_ID)
                .orElseThrow(() -> new EntityNotFoundException("CMS site content not found"));
    }

    private CmsSiteContentDto toDto(CmsSiteContent content) {
        return new CmsSiteContentDto(
                content.getAboutUsBody(),
                content.getMissionBody(),
                content.getVisionBody(),
                content.getHomeIntroTitle(),
                content.getHomeIntroBody());
    }
}
