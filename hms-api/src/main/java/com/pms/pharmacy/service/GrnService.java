package com.pms.pharmacy.service;

import com.pms.common.EntityNotFoundException;
import com.pms.pharmacy.dto.GrnDto;
import com.pms.pharmacy.dto.GrnItemDto;
import com.pms.pharmacy.dto.GrnItemRequest;
import com.pms.pharmacy.dto.GrnListEntryDto;
import com.pms.pharmacy.dto.GrnRequest;
import com.pms.pharmacy.entity.Grn;
import com.pms.pharmacy.entity.GrnItem;
import com.pms.pharmacy.entity.GrnStatus;
import com.pms.pharmacy.entity.Product;
import com.pms.pharmacy.entity.Supplier;
import com.pms.pharmacy.repository.GrnRepository;
import com.pms.pharmacy.repository.ProductRepository;
import com.pms.pharmacy.repository.SupplierRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class GrnService {

    private final GrnRepository repository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final PharmacyStockService stockService;

    public GrnService(
            GrnRepository repository,
            SupplierRepository supplierRepository,
            ProductRepository productRepository,
            PharmacyStockService stockService) {
        this.repository = repository;
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
        this.stockService = stockService;
    }

    public List<GrnListEntryDto> findAll() {
        return repository.findAllByOrderByCreatedAtDesc().stream().map(this::toListEntry).toList();
    }

    public List<GrnListEntryDto> findByStatus(GrnStatus status) {
        return repository.findByStatusOrderByCreatedAtDesc(status).stream().map(this::toListEntry).toList();
    }

    public GrnDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    @Transactional
    public GrnDto create(GrnRequest request) {
        Grn grn = new Grn();
        grn.setCreatedBy(currentUsername());
        applyFields(grn, request);
        Grn saved = repository.save(grn);
        if (saved.getStatus() == GrnStatus.APPROVED) {
            creditStock(saved);
        }
        return toDto(saved);
    }

    @Transactional
    public GrnDto update(Long id, GrnRequest request) {
        Grn grn = getOrThrow(id);
        if (grn.getStatus() == GrnStatus.APPROVED) {
            throw new IllegalArgumentException("GRN #" + id + " is already approved and can no longer be edited.");
        }
        applyFields(grn, request);
        Grn saved = repository.save(grn);
        if (saved.getStatus() == GrnStatus.APPROVED) {
            creditStock(saved);
        }
        return toDto(saved);
    }

    @Transactional
    public void delete(Long id) {
        Grn grn = getOrThrow(id);
        if (grn.getStatus() == GrnStatus.APPROVED) {
            throw new IllegalArgumentException("GRN #" + id + " is already approved and cannot be deleted.");
        }
        repository.delete(grn);
    }

    /** Only ever runs once per GRN, since update() refuses to touch an already-APPROVED GRN. */
    private void creditStock(Grn grn) {
        for (GrnItem item : grn.getItems()) {
            stockService.creditFromGrnItem(item);
        }
    }

    private void applyFields(Grn grn, GrnRequest request) {
        Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found: " + request.supplierId()));

        grn.setSupplier(supplier);
        grn.setPurchaseType(request.purchaseType());
        grn.setInvoiceNo(request.invoiceNo());
        grn.setInvoiceDate(request.invoiceDate());
        grn.setPoNumber(request.poNumber());
        grn.setGrnDate(request.grnDate());
        grn.setDiscountAmount(request.discountAmount());
        grn.setCreditNote(request.creditNote());
        grn.setDebitNote(request.debitNote());
        grn.setReturnAmount(request.returnAmount());
        grn.setStatus(request.status());

        List<GrnItem> items = new ArrayList<>();
        double total = 0;
        for (GrnItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found: " + itemRequest.productId()));

            double discountAmount = valueOrZero(itemRequest.discountAmount());
            double sgstPercent = valueOrZero(itemRequest.sgstPercent());
            double cgstPercent = valueOrZero(itemRequest.cgstPercent());
            double taxableAmount = itemRequest.purchaseRate() * itemRequest.totalQty() - discountAmount;
            double sgstAmount = taxableAmount * sgstPercent / 100;
            double cgstAmount = taxableAmount * cgstPercent / 100;
            double netValue = taxableAmount + sgstAmount + cgstAmount;

            GrnItem item = new GrnItem();
            item.setGrn(grn);
            item.setProduct(product);
            item.setProductName(product.getName());
            item.setProductTypeName(product.getProductType().getName());
            item.setPacking(itemRequest.packing());
            item.setQty(itemRequest.qty());
            item.setTotalQty(itemRequest.totalQty());
            item.setFreeQty(valueOrZero(itemRequest.freeQty()));
            item.setBatch(itemRequest.batch());
            item.setExpiryDate(itemRequest.expiryDate());
            item.setManufactureDate(itemRequest.manufactureDate());
            item.setMrp(itemRequest.mrp());
            item.setPurchaseRate(itemRequest.purchaseRate());
            item.setDiscountPercent(itemRequest.discountPercent());
            item.setDiscountAmount(discountAmount);
            item.setHsnSac(itemRequest.hsnSac());
            item.setSgstPercent(sgstPercent);
            item.setSgstAmount(sgstAmount);
            item.setCgstPercent(cgstPercent);
            item.setCgstAmount(cgstAmount);
            item.setNetValue(netValue);
            items.add(item);

            total += netValue;
        }
        grn.setItems(items);
        grn.setInvoiceAmount(total);
        grn.setGrnAmount(total);
    }

    private static Double valueOrZero(Double value) {
        return value != null ? value : 0.0;
    }

    private static Integer valueOrZero(Integer value) {
        return value != null ? value : 0;
    }

    private Grn getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("GRN not found: " + id));
    }

    private String currentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }

    private GrnListEntryDto toListEntry(Grn grn) {
        return new GrnListEntryDto(
                grn.getId(), grn.getSupplier().getName(), grn.getInvoiceNo(), grn.getGrnDate(), grn.getGrnAmount(), grn.getStatus());
    }

    private GrnDto toDto(Grn grn) {
        Supplier supplier = grn.getSupplier();
        List<GrnItemDto> items = grn.getItems().stream()
                .map(item -> new GrnItemDto(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProductName(),
                        item.getProductTypeName(),
                        item.getPacking(),
                        item.getQty(),
                        item.getTotalQty(),
                        item.getFreeQty(),
                        item.getBatch(),
                        item.getExpiryDate(),
                        item.getManufactureDate(),
                        item.getMrp(),
                        item.getPurchaseRate(),
                        item.getDiscountPercent(),
                        item.getDiscountAmount(),
                        item.getHsnSac(),
                        item.getSgstPercent(),
                        item.getSgstAmount(),
                        item.getCgstPercent(),
                        item.getCgstAmount(),
                        item.getNetValue()))
                .toList();
        return new GrnDto(
                grn.getId(),
                supplier.getId(),
                supplier.getName(),
                supplier.getAddress(),
                supplier.getMobileNumber(),
                grn.getPurchaseType(),
                grn.getInvoiceNo(),
                grn.getInvoiceDate(),
                grn.getInvoiceAmount(),
                grn.getPoNumber(),
                grn.getGrnDate(),
                grn.getGrnAmount(),
                grn.getDiscountAmount(),
                grn.getCreditNote(),
                grn.getDebitNote(),
                grn.getReturnAmount(),
                grn.getStatus(),
                items,
                grn.getCreatedBy());
    }
}
