package com.pms.pharmacy.entity;

import com.pms.common.Auditable;
import com.pms.masters.entity.Consultant;
import com.pms.registration.entity.Patient;
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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Pharmacy Billing bill header - walk-in ("Others") or against a pending
 * PharmacyRequest (OP/IP, currently always empty until that creation
 * pipeline is built - see PharmacyRequest's class doc). balanceAmount > 0
 * is how "due"/outstanding bills are identified throughout Pharmacy
 * Reports, rather than a separate status enum.
 */
@Entity
@Table(name = "pharmacy_sale")
@Getter
@Setter
@NoArgsConstructor
public class PharmacySale extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_number", nullable = false, unique = true)
    private Long billNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private PharmacyLocation location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PharmacySaleSource source;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pharmacy_request_id")
    private PharmacyRequest pharmacyRequest;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_type", nullable = false, length = 10)
    private PharmacyBillingType billingType;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", nullable = false, length = 20)
    private PharmacyPaymentMode paymentMode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultant_id")
    private Consultant consultant;

    @Column(name = "discount_percent")
    private Double discountPercent;

    @Column(name = "discount_amount")
    private Double discountAmount;

    @Column(name = "discount_reason")
    private String discountReason;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "amount_paid", nullable = false)
    private Double amountPaid;

    @Column(name = "balance_amount", nullable = false)
    private Double balanceAmount;

    @Column(length = 500)
    private String remarks;

    @Column(name = "billed_by", length = 100)
    private String billedBy;

    @Column(name = "billed_at", nullable = false)
    private Instant billedAt;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    private List<PharmacySaleItem> items = new ArrayList<>();
}
