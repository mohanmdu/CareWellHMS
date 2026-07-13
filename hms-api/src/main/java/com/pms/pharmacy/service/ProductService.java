package com.pms.pharmacy.service;

import com.pms.common.EntityNotFoundException;
import com.pms.pharmacy.dto.ProductDto;
import com.pms.pharmacy.entity.Manufacturer;
import com.pms.pharmacy.entity.Product;
import com.pms.pharmacy.entity.ProductType;
import com.pms.pharmacy.entity.Rack;
import com.pms.pharmacy.repository.ManufacturerRepository;
import com.pms.pharmacy.repository.ProductRepository;
import com.pms.pharmacy.repository.ProductTypeRepository;
import com.pms.pharmacy.repository.RackRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository repository;
    private final ProductTypeRepository productTypeRepository;
    private final RackRepository rackRepository;
    private final ManufacturerRepository manufacturerRepository;

    public ProductService(
            ProductRepository repository,
            ProductTypeRepository productTypeRepository,
            RackRepository rackRepository,
            ManufacturerRepository manufacturerRepository) {
        this.repository = repository;
        this.productTypeRepository = productTypeRepository;
        this.rackRepository = rackRepository;
        this.manufacturerRepository = manufacturerRepository;
    }

    public List<ProductDto> findActive() {
        return repository.findByActiveTrueOrderByNameAsc().stream().map(this::toDto).toList();
    }

    public List<ProductDto> findInactive() {
        return repository.findByActiveFalseOrderByUpdatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public ProductDto create(ProductDto dto) {
        Product product = new Product();
        applyFields(product, dto);
        product.setActive(true);
        return toDto(repository.save(product));
    }

    @Transactional
    public ProductDto update(Long id, ProductDto dto) {
        Product product = getOrThrow(id);
        applyFields(product, dto);
        return toDto(repository.save(product));
    }

    @Transactional
    public void deactivate(Long id) {
        Product product = getOrThrow(id);
        product.setActive(false);
        repository.save(product);
    }

    @Transactional
    public void restore(Long id) {
        Product product = getOrThrow(id);
        product.setActive(true);
        repository.save(product);
    }

    private void applyFields(Product product, ProductDto dto) {
        ProductType productType = productTypeRepository.findById(dto.productTypeId())
                .orElseThrow(() -> new EntityNotFoundException("Product Type not found: " + dto.productTypeId()));
        Rack rack = rackRepository.findById(dto.rackId())
                .orElseThrow(() -> new EntityNotFoundException("Rack not found: " + dto.rackId()));
        Manufacturer manufacturer = null;
        if (dto.manufacturerId() != null) {
            manufacturer = manufacturerRepository.findById(dto.manufacturerId())
                    .orElseThrow(() -> new EntityNotFoundException("Manufacturer not found: " + dto.manufacturerId()));
        }

        product.setName(dto.name());
        product.setProductType(productType);
        product.setProductCategory(dto.productCategory());
        product.setDrugDosage(dto.drugDosage());
        product.setDrugType(dto.drugType());
        product.setRack(rack);
        product.setManufacturer(manufacturer);
        product.setMedOrNonMed(dto.medOrNonMed());
        product.setCentralGst(dto.centralGst() != null ? dto.centralGst() : 0);
        product.setStateGst(dto.stateGst() != null ? dto.stateGst() : 0);
        product.setHsnSac(dto.hsnSac());
    }

    private Product getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Product not found: " + id));
    }

    private ProductDto toDto(Product product) {
        Manufacturer manufacturer = product.getManufacturer();
        return new ProductDto(
                product.getId(),
                product.getName(),
                product.getProductType().getId(),
                product.getProductType().getName(),
                product.getProductCategory(),
                product.getDrugDosage(),
                product.getDrugType(),
                product.getRack().getId(),
                product.getRack().getName(),
                manufacturer != null ? manufacturer.getId() : null,
                manufacturer != null ? manufacturer.getName() : null,
                product.getMedOrNonMed(),
                product.getCentralGst(),
                product.getStateGst(),
                product.getHsnSac(),
                product.isActive());
    }
}
