package com.pms.pharmacy.entity;

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
import jakarta.persistence.Version;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Sellable stock ledger row - created 1:1 from a GrnItem only when its Grn is
 * approved (see GrnService), decremented by Pharmacy Billing sales
 * (PharmacyStockService.decrement) and re-credited by returns. The
 * @Version optimistic lock mirrors the old DrugBatch's proven guard against
 * overselling under concurrent billing (that entity was removed earlier when
 * the Pharmacy module was rebuilt around Product Master, before Pharmacy
 * Billing made a real stock ledger necessary again).
 */
@Entity
@Table(name = "pharmacy_stock")
@Getter
@Setter
@NoArgsConstructor
public class PharmacyStock extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grn_item_id", nullable = false, unique = true)
    private GrnItem grnItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "product_type_name")
    private String productTypeName;

    private String batch;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "manufacture_date")
    private LocalDate manufactureDate;

    private Double mrp;

    @Column(name = "purchase_rate")
    private Double purchaseRate;

    @Column(name = "quantity_on_hand", nullable = false)
    private int quantityOnHand;

    @Version
    private long version;
}
