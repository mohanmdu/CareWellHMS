package com.pms.reporting.service;

import com.pms.ipadmission.repository.AdmissionRoomHistoryRepository;
import com.pms.ipbilling.repository.IpBillingLineItemRepository;
import com.pms.lab.repository.LabRequisitionRepository;
import com.pms.masters.entity.RevenueBucket;
import com.pms.pharmacy.entity.PharmacySaleSource;
import com.pms.pharmacy.repository.PharmacySaleRepository;
import com.pms.reporting.dto.CeoIpRevenueDto;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * CEO/MD Dashboard's IP Revenue pie chart. Room Rent, Lab & X-ray and
 * Pharmacy each come from their own dedicated, authoritative source rather
 * than IpBillingLineItem's revenue_bucket tag (which only ever distinguishes
 * Consulting Fee from everything else here) - see the doc comments on each
 * repository query this pulls from.
 */
@Service
@Transactional(readOnly = true)
public class CeoIpRevenueService {

    private final LabRequisitionRepository labRequisitionRepository;
    private final PharmacySaleRepository pharmacySaleRepository;
    private final AdmissionRoomHistoryRepository roomHistoryRepository;
    private final IpBillingLineItemRepository lineItemRepository;

    public CeoIpRevenueService(
            LabRequisitionRepository labRequisitionRepository,
            PharmacySaleRepository pharmacySaleRepository,
            AdmissionRoomHistoryRepository roomHistoryRepository,
            IpBillingLineItemRepository lineItemRepository) {
        this.labRequisitionRepository = labRequisitionRepository;
        this.pharmacySaleRepository = pharmacySaleRepository;
        this.roomHistoryRepository = roomHistoryRepository;
        this.lineItemRepository = lineItemRepository;
    }

    public CeoIpRevenueDto revenue(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.plusDays(1).atStartOfDay() : null;
        Instant fromInstant = fromDate != null ? fromDate.atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        Instant toInstant = toDate != null ? toDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant() : null;

        double labXray = labRequisitionRepository.sumForIpDashboard(fromDateTime, toDateTime);
        double pharmacy = pharmacySaleRepository.sumTotalAmountForDashboard(fromInstant, toInstant, PharmacySaleSource.IP);

        double roomRent = roomHistoryRepository.sumWardRevenueForDashboard(fromDateTime, toDateTime);

        double consultingFee = 0;
        double other = 0;
        for (IpBillingLineItemRepository.RevenueBucketAmount row : lineItemRepository.sumByRevenueBucket(fromInstant, toInstant)) {
            if (row.getBucket() == RevenueBucket.CONSULTING_FEE) {
                consultingFee += row.getAmount();
            } else {
                other += row.getAmount();
            }
        }

        double total = labXray + pharmacy + roomRent + consultingFee + other;
        return new CeoIpRevenueDto(labXray, pharmacy, roomRent, consultingFee, other, total);
    }
}
