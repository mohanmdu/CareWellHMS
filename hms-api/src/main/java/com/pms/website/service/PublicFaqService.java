package com.pms.website.service;

import com.pms.cms.repository.CmsFaqRepository;
import com.pms.website.dto.PublicFaqDto;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reads CmsFaqRepository directly (not through CmsFaqService) so the public
 * projection stays a narrow, deliberate facade, same idiom as
 * PublicConfigService/PublicDepartmentService.
 */
@Service
@Transactional(readOnly = true)
public class PublicFaqService {

    private final CmsFaqRepository repository;

    public PublicFaqService(CmsFaqRepository repository) {
        this.repository = repository;
    }

    public List<PublicFaqDto> list() {
        return repository.findByActiveTrueOrderBySortOrderAscQuestionAsc().stream()
                .map(faq -> new PublicFaqDto(faq.getId(), faq.getQuestion(), faq.getAnswer(), faq.getSortOrder()))
                .toList();
    }
}
