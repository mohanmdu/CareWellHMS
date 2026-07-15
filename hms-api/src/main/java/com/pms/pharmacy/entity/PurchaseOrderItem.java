package com.pms.pharmacy.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One product line raised on a PurchaseOrder. productName/productTypeName
 * are snapshotted at raise time (same reasoning as OpDirectBillingItem's
 * categoryName/componentName) so a later product rename doesn't rewrite
 * purchase history. orderQty starts null and is only ever set during
 * approval (see PurchaseOrderService.approve) - it's the editable "Order
 * Qty" column on the approval screen, distinct from the originally raised
 * qty/totalQty.
 */
@Entity
@Table(name = "purchase_order_item")
@Getter
@Setter
@NoArgsConstructor
public class PurchaseOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "product_type_name")
    private String productTypeName;

    @Column(nullable = false)
    private Integer packing = 1;

    @Column(nullable = false)
    private Integer qty;

    @Column(name = "total_qty", nullable = false)
    private Integer totalQty;

    @Column(name = "order_qty")
    private Integer orderQty;
}
