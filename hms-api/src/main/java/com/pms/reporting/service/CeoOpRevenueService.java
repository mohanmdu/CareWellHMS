package com.pms.reporting.service;

import com.pms.lab.repository.LabRequisitionItemRepository;
import com.pms.masters.entity.RevenueBucket;
import com.pms.pharmacy.entity.PharmacySaleSource;
import com.pms.pharmacy.repository.PharmacySaleRepository;
import com.pms.registration.repository.AppointmentRepository;
import com.pms.registration.repository.OpDirectBillingItemRepository;
import com.pms.reporting.dto.CeoOpRevenueDto;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * CEO/MD Dashboard's OP Revenue donut chart. Unlike the IP side, Lab and
 * Radiology are split here (matches the reference image's OP Revenue
 * legend), sourced from two places that both need folding together: real
 * Lab Requisition items (tagged via LabCategory) and ad-hoc OP Direct
 * Billing items (tagged via OpBillingCategory) - a walk-in "Lab Charge"
 * billed through OP Direct Billing is still lab revenue, not "other".
 */
@Service
@Transactional(readOnly = true)
public class CeoOpRevenueService {

    private final AppointmentRepository appointmentRepository;
    private final LabRequisitionItemRepository labRequisitionItemRepository;
    private final PharmacySaleRepository pharmacySaleRepository;
    private final OpDirectBillingItemRepository opDirectBillingItemRepository;

    public CeoOpRevenueService(
            AppointmentRepository appointmentRepository,
            LabRequisitionItemRepository labRequisitionItemRepository,
            PharmacySaleRepository pharmacySaleRepository,
            OpDirectBillingItemRepository opDirectBillingItemRepository) {
        this.appointmentRepository = appointmentRepository;
        this.labRequisitionItemRepository = labRequisitionItemRepository;
        this.pharmacySaleRepository = pharmacySaleRepository;
        this.opDirectBillingItemRepository = opDirectBillingItemRepository;
    }

    public CeoOpRevenueDto revenue(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.plusDays(1).atStartOfDay() : null;
        Instant fromInstant = fromDate != null ? fromDate.atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        Instant toInstant = toDate != null ? toDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant() : null;

        double consultingFee = appointmentRepository.sumPaidAmountForDashboard(fromInstant, toInstant);
        double pharmacy = pharmacySaleRepository.sumTotalAmountForDashboard(fromInstant, toInstant, PharmacySaleSource.OP);

        double lab = 0;
        double radiology = 0;
        double other = 0;
        for (LabRequisitionItemRepository.RevenueBucketAmount row :
                labRequisitionItemRepository.sumOpAmountByRevenueBucket(fromDateTime, toDateTime)) {
            RevenueBucket bucket = RevenueBucket.valueOf(row.getBucket());
            if (bucket == RevenueBucket.RADIOLOGY) {
                radiology += row.getAmount();
            } else {
                lab += row.getAmount();
            }
        }
        for (OpDirectBillingItemRepository.RevenueBucketAmount row :
                opDirectBillingItemRepository.sumByRevenueBucket(fromInstant, toInstant)) {
            switch (row.getBucket()) {
                case CONSULTING_FEE -> consultingFee += row.getAmount();
                case LAB -> lab += row.getAmount();
                case RADIOLOGY -> radiology += row.getAmount();
                case PHARMACY -> pharmacy += row.getAmount();
                case OTHER -> other += row.getAmount();
            }
        }

        double total = consultingFee + lab + radiology + pharmacy + other;
        return new CeoOpRevenueDto(consultingFee, lab, radiology, pharmacy, other, total);
    }
}
