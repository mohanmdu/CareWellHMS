package com.pms.website.service;

import com.pms.cms.repository.CmsNewsEventRepository;
import com.pms.website.dto.PublicNewsEventDto;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reads CmsNewsEventRepository directly (not through CmsNewsEventService) so
 * the public projection stays a narrow, deliberate facade, same idiom as
 * PublicConfigService/PublicDepartmentService.
 */
@Service
@Transactional(readOnly = true)
public class PublicNewsEventService {

    private final CmsNewsEventRepository repository;

    public PublicNewsEventService(CmsNewsEventRepository repository) {
        this.repository = repository;
    }

    public List<PublicNewsEventDto> list() {
        return repository.findByActiveTrueOrderByPublishedAtDesc().stream()
                .map(newsEvent -> new PublicNewsEventDto(
                        newsEvent.getId(),
                        newsEvent.getTitle(),
                        newsEvent.getBody(),
                        newsEvent.getEventDate(),
                        newsEvent.getCoverImagePath(),
                        newsEvent.getPublishedAt()))
                .toList();
    }
}
