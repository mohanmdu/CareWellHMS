package com.pms.pharmacy.service;

import com.pms.common.EntityNotFoundException;
import com.pms.pharmacy.dto.ApprovePurchaseOrderRequest;
import com.pms.pharmacy.dto.PurchaseOrderDto;
import com.pms.pharmacy.dto.PurchaseOrderItemDto;
import com.pms.pharmacy.dto.PurchaseOrderItemRequest;
import com.pms.pharmacy.dto.PurchaseOrderListEntryDto;
import com.pms.pharmacy.dto.PurchaseOrderRequest;
import com.pms.pharmacy.entity.Product;
import com.pms.pharmacy.entity.PurchaseOrder;
import com.pms.pharmacy.entity.PurchaseOrderItem;
import com.pms.pharmacy.entity.PurchaseOrderStatus;
import com.pms.pharmacy.entity.Supplier;
import com.pms.pharmacy.repository.ProductRepository;
import com.pms.pharmacy.repository.PurchaseOrderRepository;
import com.pms.pharmacy.repository.SupplierRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PurchaseOrderService {

    private final PurchaseOrderRepository repository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final PurchaseOrderNumberService numberService;

    public PurchaseOrderService(
            PurchaseOrderRepository repository,
            SupplierRepository supplierRepository,
            ProductRepository productRepository,
            PurchaseOrderNumberService numberService) {
        this.repository = repository;
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
        this.numberService = numberService;
    }

    public List<PurchaseOrderListEntryDto> findByStatus(PurchaseOrderStatus status) {
        return repository.findByStatusOrderByCreatedAtDesc(status).stream().map(this::toListEntry).toList();
    }

    public PurchaseOrderDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    @Transactional
    public PurchaseOrderDto create(PurchaseOrderRequest request) {
        Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found: " + request.supplierId()));

        PurchaseOrder purchaseOrder = new PurchaseOrder();
        purchaseOrder.setSupplier(supplier);
        purchaseOrder.setPoNumber(numberService.next());
        purchaseOrder.setStatus(PurchaseOrderStatus.PENDING_APPROVAL);
        purchaseOrder.setComments(request.comments());
        purchaseOrder.setCreatedBy(currentUsername());

        List<PurchaseOrderItem> items = new ArrayList<>();
        for (PurchaseOrderItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found: " + itemRequest.productId()));
            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setPurchaseOrder(purchaseOrder);
            item.setProduct(product);
            item.setProductName(product.getName());
            item.setProductTypeName(product.getProductType().getName());
            item.setPacking(itemRequest.packing());
            item.setQty(itemRequest.qty());
            item.setTotalQty(itemRequest.totalQty());
            items.add(item);
        }
        purchaseOrder.setItems(items);

        return toDto(repository.save(purchaseOrder));
    }

    @Transactional
    public PurchaseOrderDto approve(Long id, ApprovePurchaseOrderRequest request) {
        PurchaseOrder purchaseOrder = getOrThrow(id);
        Map<Long, Integer> orderQtyByItemId = request.items().stream()
                .collect(Collectors.toMap(
                        ApprovePurchaseOrderRequest.PurchaseOrderItemApproval::itemId,
                        ApprovePurchaseOrderRequest.PurchaseOrderItemApproval::orderQty));

        for (PurchaseOrderItem item : purchaseOrder.getItems()) {
            Integer orderQty = orderQtyByItemId.get(item.getId());
            item.setOrderQty(orderQty != null ? orderQty : item.getTotalQty());
        }

        purchaseOrder.setStatus(PurchaseOrderStatus.APPROVED);
        purchaseOrder.setApprovedBy(currentUsername());
        purchaseOrder.setApprovedAt(Instant.now());
        return toDto(repository.save(purchaseOrder));
    }

    @Transactional
    public void cancel(Long id) {
        PurchaseOrder purchaseOrder = getOrThrow(id);
        purchaseOrder.setStatus(PurchaseOrderStatus.CANCELLED);
        repository.save(purchaseOrder);
    }

    private PurchaseOrder getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Purchase Order not found: " + id));
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private PurchaseOrderListEntryDto toListEntry(PurchaseOrder purchaseOrder) {
        return new PurchaseOrderListEntryDto(
                purchaseOrder.getId(),
                purchaseOrder.getPoNumber(),
                purchaseOrder.getSupplier().getName(),
                purchaseOrder.getStatus(),
                purchaseOrder.getCreatedAt(),
                purchaseOrder.getCreatedBy());
    }

    private PurchaseOrderDto toDto(PurchaseOrder purchaseOrder) {
        Supplier supplier = purchaseOrder.getSupplier();
        List<PurchaseOrderItemDto> items = purchaseOrder.getItems().stream()
                .map(item -> new PurchaseOrderItemDto(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProductName(),
                        item.getProductTypeName(),
                        item.getPacking(),
                        item.getQty(),
                        item.getTotalQty(),
                        item.getOrderQty()))
                .toList();
        return new PurchaseOrderDto(
                purchaseOrder.getId(),
                purchaseOrder.getPoNumber(),
                supplier.getId(),
                supplier.getName(),
                supplier.getContactPersonName(),
                supplier.getAddress(),
                supplier.getMobileNumber(),
                purchaseOrder.getStatus(),
                items,
                purchaseOrder.getComments(),
                purchaseOrder.getCreatedBy(),
                purchaseOrder.getCreatedAt(),
                purchaseOrder.getApprovedBy(),
                purchaseOrder.getApprovedAt());
    }
}
