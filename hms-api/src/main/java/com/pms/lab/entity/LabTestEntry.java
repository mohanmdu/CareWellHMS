package com.pms.lab.entity;

import com.pms.common.Auditable;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The lab technician's work order for one billed LabRequisition - created
 * automatically when LabRequisitionService.approve() records payment (see
 * that method), one per requisition. Its own id doubles as the "Lab Id"
 * shown in the reference rather than a separate sequence.
 */
@Entity
@Table(name = "lab_test_entry")
@Getter
@Setter
@NoArgsConstructor
public class LabTestEntry extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisition_id", nullable = false, unique = true)
    private LabRequisition requisition;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private LabTestEntryStatus status = LabTestEntryStatus.NEW;

    /** Comma-joined selection from Blood/Urine/Stool/Fluids/Sputum/Semen/Tissues/Others. */
    @Column(name = "specimen_types")
    private String specimenTypes;

    @Column(name = "reported_date")
    private LocalDateTime reportedDate;

    @Column(length = 500)
    private String remarks;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "approved_by")
    private String approvedBy;

    @OneToMany(mappedBy = "labTestEntry", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<LabTestResult> results = new ArrayList<>();
}
