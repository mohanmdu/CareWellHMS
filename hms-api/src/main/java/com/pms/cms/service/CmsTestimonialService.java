package com.pms.cms.service;

import com.pms.cms.dto.CmsTestimonialDto;
import com.pms.cms.entity.CmsTestimonial;
import com.pms.cms.repository.CmsTestimonialRepository;
import com.pms.common.EntityNotFoundException;
import com.pms.common.FileStorageService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional(readOnly = true)
public class CmsTestimonialService {

    private final CmsTestimonialRepository repository;
    private final FileStorageService fileStorageService;

    public CmsTestimonialService(CmsTestimonialRepository repository, FileStorageService fileStorageService) {
        this.repository = repository;
        this.fileStorageService = fileStorageService;
    }

    public List<CmsTestimonialDto> findActive() {
        return repository.findByActiveTrueOrderByCreatedAtDesc().stream().map(this::toDto).toList();
    }

    public List<CmsTestimonialDto> findInactive() {
        return repository.findByActiveFalseOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public CmsTestimonialDto create(CmsTestimonialDto dto) {
        CmsTestimonial testimonial = new CmsTestimonial();
        applyFields(testimonial, dto);
        testimonial.setActive(true);
        return toDto(repository.save(testimonial));
    }

    @Transactional
    public CmsTestimonialDto update(Long id, CmsTestimonialDto dto) {
        CmsTestimonial testimonial = getOrThrow(id);
        applyFields(testimonial, dto);
        return toDto(repository.save(testimonial));
    }

    @Transactional
    public void deactivate(Long id) {
        CmsTestimonial testimonial = getOrThrow(id);
        testimonial.setActive(false);
        repository.save(testimonial);
    }

    @Transactional
    public void restore(Long id) {
        CmsTestimonial testimonial = getOrThrow(id);
        testimonial.setActive(true);
        repository.save(testimonial);
    }

    @Transactional
    public CmsTestimonialDto uploadImage(Long id, MultipartFile file) {
        CmsTestimonial testimonial = getOrThrow(id);
        testimonial.setPhotoPath(fileStorageService.store(file, "cms"));
        return toDto(repository.save(testimonial));
    }

    private void applyFields(CmsTestimonial testimonial, CmsTestimonialDto dto) {
        testimonial.setPatientName(dto.patientName());
        testimonial.setQuote(dto.quote());
        testimonial.setRating(dto.rating());
    }

    private CmsTestimonial getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Testimonial not found: " + id));
    }

    private CmsTestimonialDto toDto(CmsTestimonial testimonial) {
        return new CmsTestimonialDto(
                testimonial.getId(), testimonial.getPatientName(), testimonial.getQuote(), testimonial.getRating(), testimonial.getPhotoPath(), testimonial.isActive());
    }
}
