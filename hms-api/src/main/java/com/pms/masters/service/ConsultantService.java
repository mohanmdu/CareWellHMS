package com.pms.masters.service;

import com.pms.common.EntityNotFoundException;
import com.pms.masters.dto.ConsultantDto;
import com.pms.masters.entity.Consultant;
import com.pms.masters.entity.Department;
import com.pms.masters.repository.ConsultantRepository;
import com.pms.masters.repository.DepartmentRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ConsultantService {

    private final ConsultantRepository repository;
    private final DepartmentRepository departmentRepository;

    public ConsultantService(ConsultantRepository repository, DepartmentRepository departmentRepository) {
        this.repository = repository;
        this.departmentRepository = departmentRepository;
    }

    public List<ConsultantDto> findAll() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    public ConsultantDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    @Transactional
    public ConsultantDto create(ConsultantDto dto) {
        Consultant consultant = new Consultant();
        applyFields(consultant, dto);
        consultant.setActive(true);
        return toDto(repository.save(consultant));
    }

    @Transactional
    public ConsultantDto update(Long id, ConsultantDto dto) {
        Consultant consultant = getOrThrow(id);
        applyFields(consultant, dto);
        return toDto(repository.save(consultant));
    }

    @Transactional
    public void deactivate(Long id) {
        Consultant consultant = getOrThrow(id);
        consultant.setActive(false);
        repository.save(consultant);
    }

    private void applyFields(Consultant consultant, ConsultantDto dto) {
        Department department = departmentRepository.findById(dto.departmentId())
                .orElseThrow(() -> new EntityNotFoundException("Department not found: " + dto.departmentId()));
        consultant.setName(dto.name());
        consultant.setDepartment(department);
        consultant.setSpecialization(dto.specialization());
        consultant.setEmail(dto.email());
        consultant.setMobileNumber(dto.mobileNumber());
        consultant.setConsultationFee(dto.consultationFee() != null ? dto.consultationFee() : 0.0);
    }

    private Consultant getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Consultant not found: " + id));
    }

    private ConsultantDto toDto(Consultant consultant) {
        return new ConsultantDto(
                consultant.getId(),
                consultant.getName(),
                consultant.getDepartment().getId(),
                consultant.getDepartment().getName(),
                consultant.getSpecialization(),
                consultant.getEmail(),
                consultant.getMobileNumber(),
                consultant.getConsultationFee(),
                consultant.isActive());
    }
}
