package com.pms.pharmacy.entity;

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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Goods Receipt Note - records what actually arrived from a Supplier.
 * poNumber is a free-text cross-reference (not an FK to PurchaseOrder) -
 * the legacy screen lets a GRN be raised against any Supplier independent
 * of a specific PO, which is also what makes a future "Direct GRN" (no PO
 * reference at all) trivial: same entity/screen, poNumber left blank.
 */
@Entity
@Table(name = "grn")
@Getter
@Setter
@NoArgsConstructor
public class Grn extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Enumerated(EnumType.STRING)
    @Column(name = "purchase_type", nullable = false, length = 20)
    private PurchaseType purchaseType;

    @Column(name = "invoice_no", nullable = false)
    private String invoiceNo;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    // Computed server-side from the sum of item netValues - never accepted from the client.
    @Column(name = "invoice_amount", nullable = false)
    private Double invoiceAmount = 0.0;

    @Column(name = "po_number", length = 50)
    private String poNumber;

    @Column(name = "grn_date", nullable = false)
    private LocalDate grnDate;

    // Mirrors invoiceAmount - both are the same computed total, kept as separate
    // columns because the legacy form displays them as two distinct read-only fields.
    @Column(name = "grn_amount", nullable = false)
    private Double grnAmount = 0.0;

    @Column(name = "discount_amount")
    private Double discountAmount;

    @Column(name = "credit_note")
    private String creditNote;

    @Column(name = "debit_note")
    private String debitNote;

    @Column(name = "return_amount")
    private Double returnAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GrnStatus status = GrnStatus.DRAFT;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @OneToMany(mappedBy = "grn", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    private List<GrnItem> items = new ArrayList<>();
}
