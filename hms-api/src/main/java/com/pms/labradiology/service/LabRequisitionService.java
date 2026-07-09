package com.pms.labradiology.service;

import com.pms.billing.entity.BillingItem;
import com.pms.billing.repository.BillingItemRepository;
import com.pms.common.EntityNotFoundException;
import com.pms.labradiology.dto.LabRequisitionDto;
import com.pms.labradiology.dto.LabRequisitionItemDto;
import com.pms.labradiology.entity.LabRequisition;
import com.pms.labradiology.entity.LabRequisitionItem;
import com.pms.labradiology.entity.RequisitionItemStatus;
import com.pms.labradiology.entity.RequisitionStatus;
import com.pms.labradiology.repository.LabRequisitionItemRepository;
import com.pms.labradiology.repository.LabRequisitionRepository;
import com.pms.registration.entity.Appointment;
import com.pms.registration.entity.Patient;
import com.pms.registration.repository.AppointmentRepository;
import com.pms.registration.repository.PatientRepository;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Replaces LabAction's requisitionInput/requisitionInputforIP/requisitionInputOP
 * (one method, three action names - migration doc §4.4) with one endpoint,
 * and the raw "byPass" int flag with the explicit RequisitionItemStatus
 * state machine.
 */
@Service
@Transactional(readOnly = true)
public class LabRequisitionService {

    private final LabRequisitionRepository repository;
    private final LabRequisitionItemRepository itemRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final BillingItemRepository billingItemRepository;
    private final AtomicInteger sequence = new AtomicInteger(0);

    public LabRequisitionService(
            LabRequisitionRepository repository,
            LabRequisitionItemRepository itemRepository,
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            BillingItemRepository billingItemRepository) {
        this.repository = repository;
        this.itemRepository = itemRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.billingItemRepository = billingItemRepository;
        this.sequence.set((int) repository.count());
    }

    public List<LabRequisitionDto> findAll() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    public LabRequisitionDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    @Transactional
    public LabRequisitionDto create(LabRequisitionDto dto) {
        Patient patient = patientRepository.findById(dto.patientId())
                .orElseThrow(() -> new EntityNotFoundException("Patient not found: " + dto.patientId()));

        LabRequisition requisition = new LabRequisition();
        requisition.setRequisitionNumber(nextRequisitionNumber());
        requisition.setPatient(patient);
        requisition.setNotes(dto.notes());
        requisition.setStatus(RequisitionStatus.ORDERED);

        if (dto.appointmentId() != null) {
            Appointment appointment = appointmentRepository.findById(dto.appointmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Appointment not found: " + dto.appointmentId()));
            requisition.setAppointment(appointment);
        }

        List<LabRequisitionItem> items = new ArrayList<>();
        for (LabRequisitionItemDto itemDto : dto.items()) {
            BillingItem test = billingItemRepository.findById(itemDto.billingItemId())
                    .orElseThrow(() -> new EntityNotFoundException("Billing item not found: " + itemDto.billingItemId()));
            LabRequisitionItem item = new LabRequisitionItem();
            item.setRequisition(requisition);
            item.setTest(test);
            item.setSpecimenType(itemDto.specimenType());
            item.setStatus(RequisitionItemStatus.PENDING);
            items.add(item);
        }
        requisition.setItems(items);

        return toDto(repository.save(requisition));
    }

    @Transactional
    public LabRequisitionDto collectSpecimen(Long requisitionId, Long itemId) {
        return transitionItem(requisitionId, itemId, item -> {
            requireStatus(item, RequisitionItemStatus.PENDING);
            item.setStatus(RequisitionItemStatus.SPECIMEN_COLLECTED);
        });
    }

    @Transactional
    public LabRequisitionDto enterResult(Long requisitionId, Long itemId, String resultValue, String normalRange) {
        return transitionItem(requisitionId, itemId, item -> {
            requireStatus(item, RequisitionItemStatus.SPECIMEN_COLLECTED);
            item.setResultValue(resultValue);
            item.setNormalRange(normalRange);
            item.setStatus(RequisitionItemStatus.RESULT_ENTERED);
        });
    }

    @Transactional
    public LabRequisitionDto approve(Long requisitionId, Long itemId) {
        return transitionItem(requisitionId, itemId, item -> {
            requireStatus(item, RequisitionItemStatus.RESULT_ENTERED);
            item.setStatus(RequisitionItemStatus.APPROVED);
        });
    }

    @Transactional
    public LabRequisitionDto cancel(Long id) {
        LabRequisition requisition = getOrThrow(id);
        requisition.setStatus(RequisitionStatus.CANCELLED);
        return toDto(repository.save(requisition));
    }

    private LabRequisitionDto transitionItem(Long requisitionId, Long itemId, java.util.function.Consumer<LabRequisitionItem> mutator) {
        LabRequisition requisition = getOrThrow(requisitionId);
        LabRequisitionItem item = requisition.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Requisition item not found: " + itemId));
        mutator.accept(item);
        itemRepository.save(item);
        return toDto(requisition);
    }

    private void requireStatus(LabRequisitionItem item, RequisitionItemStatus expected) {
        if (item.getStatus() != expected) {
            throw new IllegalArgumentException(
                    "Expected item status " + expected + " but was " + item.getStatus());
        }
    }

    private String nextRequisitionNumber() {
        return "REQ-" + Year.now().getValue() + "-" + String.format("%05d", sequence.incrementAndGet());
    }

    private LabRequisition getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Requisition not found: " + id));
    }

    private LabRequisitionDto toDto(LabRequisition requisition) {
        List<LabRequisitionItemDto> items = requisition.getItems().stream()
                .map(i -> new LabRequisitionItemDto(
                        i.getId(), i.getTest().getId(), i.getTest().getName(), i.getSpecimenType(), i.getStatus(), i.getResultValue(), i.getNormalRange()))
                .toList();
        Patient patient = requisition.getPatient();
        return new LabRequisitionDto(
                requisition.getId(),
                requisition.getRequisitionNumber(),
                patient.getId(),
                (patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "")).trim(),
                requisition.getAppointment() != null ? requisition.getAppointment().getId() : null,
                requisition.getStatus(),
                requisition.getNotes(),
                items);
    }
}
