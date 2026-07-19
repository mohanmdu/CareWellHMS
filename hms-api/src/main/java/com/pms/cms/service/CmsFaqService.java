package com.pms.cms.service;

import com.pms.cms.dto.CmsFaqDto;
import com.pms.cms.entity.CmsFaq;
import com.pms.cms.repository.CmsFaqRepository;
import com.pms.common.EntityNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CmsFaqService {

    private final CmsFaqRepository repository;

    public CmsFaqService(CmsFaqRepository repository) {
        this.repository = repository;
    }

    public List<CmsFaqDto> findActive() {
        return repository.findByActiveTrueOrderBySortOrderAscQuestionAsc().stream().map(this::toDto).toList();
    }

    public List<CmsFaqDto> findInactive() {
        return repository.findByActiveFalseOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public CmsFaqDto create(CmsFaqDto dto) {
        CmsFaq faq = new CmsFaq();
        applyFields(faq, dto);
        faq.setActive(true);
        return toDto(repository.save(faq));
    }

    @Transactional
    public CmsFaqDto update(Long id, CmsFaqDto dto) {
        CmsFaq faq = getOrThrow(id);
        applyFields(faq, dto);
        return toDto(repository.save(faq));
    }

    @Transactional
    public void deactivate(Long id) {
        CmsFaq faq = getOrThrow(id);
        faq.setActive(false);
        repository.save(faq);
    }

    @Transactional
    public void restore(Long id) {
        CmsFaq faq = getOrThrow(id);
        faq.setActive(true);
        repository.save(faq);
    }

    private void applyFields(CmsFaq faq, CmsFaqDto dto) {
        faq.setQuestion(dto.question());
        faq.setAnswer(dto.answer());
        faq.setSortOrder(dto.sortOrder());
    }

    private CmsFaq getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("FAQ not found: " + id));
    }

    private CmsFaqDto toDto(CmsFaq faq) {
        return new CmsFaqDto(faq.getId(), faq.getQuestion(), faq.getAnswer(), faq.getSortOrder(), faq.isActive());
    }
}
