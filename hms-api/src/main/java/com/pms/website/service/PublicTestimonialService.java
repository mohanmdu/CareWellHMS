package com.pms.website.service;

import com.pms.cms.repository.CmsTestimonialRepository;
import com.pms.website.dto.PublicTestimonialDto;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reads CmsTestimonialRepository directly (not through CmsTestimonialService)
 * so the public projection stays a narrow, deliberate facade, same idiom as
 * PublicConfigService/PublicDepartmentService.
 */
@Service
@Transactional(readOnly = true)
public class PublicTestimonialService {

    private final CmsTestimonialRepository repository;

    public PublicTestimonialService(CmsTestimonialRepository repository) {
        this.repository = repository;
    }

    public List<PublicTestimonialDto> list() {
        return repository.findByActiveTrueOrderByCreatedAtDesc().stream()
                .map(testimonial -> new PublicTestimonialDto(
                        testimonial.getId(),
                        testimonial.getPatientName(),
                        testimonial.getQuote(),
                        testimonial.getRating(),
                        testimonial.getPhotoPath()))
                .toList();
    }
}
