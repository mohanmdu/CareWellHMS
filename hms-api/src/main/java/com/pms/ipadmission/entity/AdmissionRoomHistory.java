package com.pms.ipadmission.entity;

import com.pms.common.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One room-occupancy period for an admission - opened whenever a bed is
 * assigned (initial Ward Allocation or a Ward Change) and closed when the
 * patient moves again. toDate == null means the patient is still in that
 * room. IpBillingService sums dailyRate x period length across every period
 * to bill Ward/Bed Charges correctly once a mid-stay ward change happens,
 * instead of pricing the entire stay at whatever room the patient currently
 * occupies.
 */
@Entity
@Table(name = "admission_room_history")
@Getter
@Setter
@NoArgsConstructor
public class AdmissionRoomHistory extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admission_id", nullable = false)
    private Admission admission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "from_date", nullable = false)
    private LocalDateTime fromDate;

    @Column(name = "to_date")
    private LocalDateTime toDate;
}
